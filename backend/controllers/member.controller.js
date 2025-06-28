import { addMonthsToDate } from "../utils/date.utils.js";
import Member from "../models/member.model.js";
import Membership from "../models/membership.model.js";

export const registerMember=async(req,res)=>{
    try {
        const {
            // Basic Information
            name, email, phone, address, age, gender, profileImage, membership, joinDate,
            
            // Health Metrics
            height, weight, bmi, bodyFat, muscleMass,
            
            // Body Measurements
            bodyMeasurements,
            
            // Workout Routine
            workoutRoutine,
            
            // Personal Trainer
            personalTrainer,
            
            // Notes
            notes,
            
            // Membership
            nextBillDate
        } = req.body;
        
        // Validate required fields
        if(!name || !email || !phone || !address || !age || !gender || !profileImage || !membership || !height || !weight){
            return res.status(400).json({
                success:false,
                message:"All required fields must be provided (name, email, phone, address, age, gender, profileImage, membership, height, weight)"
            })
        }

        const existingMember=await Member.findOne({gym:req.gym._id,phone});
        if(existingMember){
            return res.status(400).json({
                success:false,
                message:"Member already exists with this phone number"
            })
        }

        const membershipDetails=await Membership.findOne({_id:membership,gym:req.gym._id});
        if(!membershipDetails){
            return res.status(400).json({
                success:false,
                message:"Invalid membership selected"
            })
        }

        const joinDateObj = joinDate ? new Date(joinDate) : new Date();
        const calculatedNextBillDate = nextBillDate ? new Date(nextBillDate) : new Date(joinDateObj);
        if (!nextBillDate) {
            calculatedNextBillDate.setMonth(calculatedNextBillDate.getMonth() + membershipDetails.months);
        }

        // Calculate BMI if not provided
        let calculatedBMI = bmi;
        if (!bmi && height && weight) {
            const heightInMeters = height / 100;
            calculatedBMI = (weight / (heightInMeters * heightInMeters)).toFixed(1);
        }

        const member=await Member.create({
            // Basic Information
            name,
            email,
            phone: phone.toString().trim(),
            address,
            age: Number(age),
            gender,
            profileImage,
            
            // Health Metrics
            height: Number(height),
            weight: Number(weight),
            bmi: Number(calculatedBMI),
            bodyFat: bodyFat ? Number(bodyFat) : undefined,
            muscleMass: muscleMass ? Number(muscleMass) : undefined,
            
            // Body Measurements
            bodyMeasurements: bodyMeasurements || {
                chest: undefined,
                waist: undefined,
                hips: undefined,
                biceps: undefined,
                thighs: undefined,
                calves: undefined,
                wrist: undefined,
                neck: undefined,
                forearm: undefined,
                ankle: undefined
            },
            
            // Workout Routine
            workoutRoutine: workoutRoutine || {
                monday: "Rest",
                tuesday: "Rest",
                wednesday: "Rest",
                thursday: "Rest",
                friday: "Rest",
                saturday: "Rest",
                sunday: "Rest"
            },
            
            // Personal Trainer
            personalTrainer: personalTrainer || {
                name: "",
                phone: ""
            },
            
            // Notes
            notes: notes || "",
            
            // Membership Information
            gym: req.gym._id,
            membership: membership,
            joinDate: joinDateObj,
            nextBillDate: calculatedNextBillDate
        });

        res.status(201).json({
            success:true,
            message:"Member registered successfully",
            member
        })
        
    } catch (error) {
        console.error("Error in registerMember:", error);
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

export const getAllMembers=async(req,res)=>{
    try {
        const members=await Member.find({gym:req.gym._id});
        const totalMembers=members.length;
        const {skip,limit}=req.query;
        const limitedMembers=await Member.find({gym:req.gym._id})
            .populate('membership', 'name months price')
            .sort({createdAt:-1})
            .skip(skip)
            .limit(limit);
        res.status(200).json({
            success:true,
            message:members.length>0?"Members fetched successfully":"No members found",
            members:limitedMembers,
            totalMembers
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

export const searchedMembers=async(req,res)=>{
    try{
        const {searchTerm}=req.query;
        const members= await Member.find({
            gym:req.gym._id,
            $or:[
                {name:{$regex : '^' + searchTerm, $options:'i'}},
                {phone: {$regex: '^' + searchTerm, $options: 'i'}}
            ]
        }).populate('membership', 'name months price')
        res.status(200).json({
            success:true,
            message:members.length>0?"Members fetched successfully":"No members found",
            members
        })  
    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

export const monthlyMembers=async(req,res)=>{
    try{
        const now = new Date();
        // getMonth gives index that for month 12 it gives 0
        const lastDayOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0); // last date of previous month
        const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999); // last date of current month
        const monthlyMembers = await Member.find({
            gym:req.gym._id,
            joinDate:{
                $gte:lastDayOfPreviousMonth,
                $lte:endOfCurrentMonth
            }
        }).populate('membership', 'name months price').sort({joinDate:-1})  
        res.status(200).json({
            success:true,
            message:monthlyMembers.length>0?"Monthly members fetched successfully":"No members found",
            monthlyMembers,
            monthlyMembersCount:monthlyMembers.length
        })        
    }catch(error){
        console.error("Error in monthlyMembers:", error);
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

export const expiringInSevenDays=async(req,res)=>{
    try{
        const today=new Date();
        const sevenDaysFromNow=new Date(today.getFullYear(),today.getMonth(),today.getDate()+7);
        const expiringMembers=await Member.find({
            gym:req.gym._id,
            nextBillDate:{
                $gte:today,
                $lte:sevenDaysFromNow
            }
        }).populate('membership', 'name months price').sort({nextBillDate:-1})
        res.status(200).json({
            success:true,
            message:expiringMembers.length>0?"Expiring members fetched successfully":"No Expiring Members found in next 7 days",
            expiringMembers,
            expiringMembersCount:expiringMembers.length
        })
    }catch(error){
            console.error("Error in expiringInSevenDays:", error);
            res.status(500).json({
                success:false,
                message:error.message
            })
        }
}

export const expiredMembers=async(req,res)=>{
    try{
        const today=new Date();
        const expiredMembers=await Member.find({
            gym:req.gym._id,
            status:"Active",
            nextBillDate:{$lt:today}
        }).populate('membership', 'name months price').sort({nextBillDate:-1})
        res.status(200).json({
            success:true,
            message:expiredMembers.length>0?"Expired members fetched successfully":"No Expired Members found",
            expiredMembers,
            expiredMembersCount:expiredMembers.length
        })
    }catch(error){
        console.error("Error in expiredMembers:", error);
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

export const inactiveMembers=async(req,res)=>{
    try{
        const inactiveMembers=await Member.find({
            gym:req.gym._id,
            status:"Inactive"
        }).populate('membership', 'name months price').sort({nextBillDate:-1})
        res.status(200).json({
            success:true,
            message:inactiveMembers.length>0?"Inactive members fetched successfully":"No Inactive Members found",
            inactiveMembers,
            inactiveMembersCount:inactiveMembers.length
        })
    }catch(error){
        console.error("Error in inactiveMembers:", error);
        res.status(500).json({
            success:false,
            message:error.message
        })
    }

}

export const memberDetail = async (req,res) => {
    try{
        const {id}=req.params;
        const member=await Member.findOne({gym:req.gym._id,_id:id}).populate('membership', 'name months price');
        if(!member){
            return res.status(404).json({
                success:false,
                message:"Member not found"
            })
        }
        res.status(200).json({
            success:true,
            message:"Member fetched successfully",
            member
        })
    }catch(error){
        console.error("Error in memberDetail:", error);
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

export const changeStatus=async(req,res)=>{
    try{
        const {id}=req.params;
        const {status}=req.body;
        const member=await Member.findOne({gym:req.gym._id,_id:id});
        if(!member){
            return res.status(404).json({
                success:false,
                message:"Member not found"
            })
        }
        // console.log(member);
        member.status=status;
        await member.save();
        res.status(200).json({
            success:true,
            message:"Status changed successfully",
            member
        })
    }catch(error){
        console.error("Error in changeStatus:", error);
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

export const renewMembership=async(req,res)=>{
    try{
        const {id}=req.params;
        const {membershipId}=req.body;
        const membership = await Membership.findOne({_id:membershipId,gym:req.gym._id});
        if(!membership){
            return res.status(404).json({
                success:false,
                message:"Membership not found"
            })
        }
        let getMonths = membership.months;
        let today = new Date();
        let nextBillDate = addMonthsToDate(today,getMonths);
        const member=await Member.findOne({gym:req.gym._id,_id:id});
        if(!member){
            return res.status(404).json({
                success:false,
                message:"Member not found"
            })
        }
        member.membership=membershipId;
        member.nextBillDate=nextBillDate;
        member.lastPayment=today;
        await member.save();
        res.status(200).json({
            success:true,
            message:"Membership renewed successfully",
        })
    }catch(error){
        console.error("Error in renewMembership:", error);
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

export const updateMember = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            // Basic Information
            name, email, phone, address, age, profileImage,
            
            // Health Metrics
            height, weight, bmi, bodyFat, muscleMass,
            
            // Body Measurements
            bodyMeasurements,
            
            // Workout Routine
            workoutRoutine,
            
            // Personal Trainer
            personalTrainer,
            
            // Notes
            notes
        } = req.body;

        const member = await Member.findOne({ gym: req.gym._id, _id: id });
        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            });
        }

        // Update basic information
        if (name) member.name = name;
        if (email) member.email = email;
        if (phone) member.phone = phone.toString().trim();
        if (address) member.address = address;
        if (age) member.age = Number(age);
        if (profileImage) member.profileImage = profileImage;

        // Update health metrics
        if (height) member.height = Number(height);
        if (weight) member.weight = Number(weight);
        if (bodyFat !== undefined) member.bodyFat = Number(bodyFat);
        if (muscleMass !== undefined) member.muscleMass = Number(muscleMass);

        // Calculate BMI if height or weight changed
        if ((height || member.height) && (weight || member.weight)) {
            const currentHeight = height || member.height;
            const currentWeight = weight || member.weight;
            const heightInMeters = currentHeight / 100;
            member.bmi = Number((currentWeight / (heightInMeters * heightInMeters)).toFixed(1));
        }

        // Update body measurements
        if (bodyMeasurements) {
            member.bodyMeasurements = {
                ...member.bodyMeasurements,
                ...bodyMeasurements
            };
        }

        // Update workout routine
        if (workoutRoutine) {
            member.workoutRoutine = {
                ...member.workoutRoutine,
                ...workoutRoutine
            };
        }

        // Update personal trainer
        if (personalTrainer) {
            member.personalTrainer = {
                ...member.personalTrainer,
                ...personalTrainer
            };
        }

        // Update notes
        if (notes !== undefined) member.notes = notes;

        await member.save();

        res.status(200).json({
            success: true,
            message: "Member updated successfully",
            member
        });

    } catch (error) {
        console.error("Error in updateMember:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};