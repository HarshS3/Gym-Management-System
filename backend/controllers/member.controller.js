import { addMonthsToDate } from "../utils/date.utils.js";
import Member from "../models/member.model.js";
import Membership from "../models/membership.model.js";
import nodemailer from "nodemailer";
import { emailMemberJsPdf } from "../utils/memberPdf.js";
import dotenv from "dotenv";
import Payment from "../models/payment.model.js";

dotenv.config();

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

        // If online payment info provided, store payment record
        const { paymentMode, paymentInfo } = req.body;
        if (paymentMode === 'online' && paymentInfo && paymentInfo.razorpay_payment_id) {
          try {
            await Payment.create({
              member: member._id,
              membership: membership,
              orderId: paymentInfo.razorpay_order_id,
              paymentId: paymentInfo.razorpay_payment_id,
              amount: membershipDetails.price, // rupees
              currency: 'INR',
              method: 'online',
              status: 'captured',
            });

            // send invoice email (basic)
            const transporterInv = nodemailer.createTransport({
              host: 'smtp.gmail.com',
              port: 587,
              secure: false,
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
              },
              tls: { rejectUnauthorized: false },
            });

            await transporterInv.sendMail({
              from: process.env.EMAIL_USER,
              to: member.email,
              subject: 'Payment Invoice - Gym Membership',
              html: `<h3>Hi ${member.name},</h3>
                <p>Thank you for your payment. Here are your transaction details:</p>
                <ul>
                  <li>Order ID: ${paymentInfo.razorpay_order_id}</li>
                  <li>Payment ID: ${paymentInfo.razorpay_payment_id}</li>
                  <li>Plan: ${membershipDetails.months} month(s)</li>
                  <li>Amount: ₹${membershipDetails.price}</li>
                  <li>Date: ${new Date().toLocaleDateString()}</li>
                </ul>
                <p>We appreciate your business and wish you success on your fitness journey!</p>`
            });
          } catch (payErr) {
            console.error('Error storing payment or sending invoice:', payErr);
          }
        }

        if (paymentMode === 'cash') {
          try {
            await Payment.create({
              member: member._id,
              membership,
              orderId: 'CASH-' + Date.now(),
              paymentId: 'CASH',
              amount: membershipDetails.price,
              currency: 'INR',
              method: 'cash',
              status: 'received',
            });
            // (optional) send "cash receipt" e-mail here
          } catch (err) {
            console.error('Error storing cash payment:', err);
          }
        }

        // Generate PDF and email it – do not block response if email fails
        (async () => {
          try {
            const pdfBuffer = await emailMemberJsPdf(member);

            if (pdfBuffer) {
              const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false, // use STARTTLS
                auth: {
                  user: process.env.EMAIL_USER,
                  pass: process.env.EMAIL_PASS,
                },
                tls: {
                  rejectUnauthorized: false,
                },
              });

              await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: member.email,
                subject: 'Your Gym Membership Details',
                text: `Hi ${member.name},\n\nAttached is a PDF containing your membership and health details. Welcome to the gym!`,
                attachments: [
                  {
                    filename: `${member.name.replace(/\s+/g, '_')}_profile.pdf`,
                    content: pdfBuffer,
                  },
                ],
              });

              console.log(`📧 Member PDF email successfully sent to ${member.email}`);
            } else {
              console.warn(`PDF generation failed for member ${member.email}; skipping email.`);
            }
          } catch (emailErr) {
            console.error('Failed to send member PDF email:', emailErr);
          }
        })();

        // Notify face-recognition service to reload faces (non-blocking)
        (async () => {
          try {
            await fetch('http://localhost:5001/refresh-faces', { method: 'POST' });
          } catch (err) {
            console.error('Failed to refresh faces on Face API:', err);
          }
        })();

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
        let { month } = req.query; // expected format YYYY-MM

        let startDate, endDate;

        if (month) {
            // Parse year and month
            const [yearStr, monthStr] = month.split('-');
            const year = parseInt(yearStr, 10);
            const monthIndex = parseInt(monthStr, 10) - 1; // JS Date month is 0-based

            if (!isNaN(year) && !isNaN(monthIndex) && monthIndex >= 0 && monthIndex <= 11) {
                startDate = new Date(year, monthIndex, 1);
                endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
            }
        }

        if (!startDate || !endDate) {
            // Fallback to current month if invalid or not provided
            const now = new Date();
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        }

        const monthlyMembers = await Member.find({
            gym:req.gym._id,
            joinDate:{
                $gte:startDate,
                $lte:endDate
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
        const today = new Date();
        const expiredMembers = await Member.find({
            gym: req.gym._id,
            nextBillDate: { $lt: today }
        });

        const totalExpiredMembers = expiredMembers.length;

        // Then get paginated data
        const { skip = 0, limit = 10 } = req.query;
        const paginatedExpiredMembers = await Member.find({
            gym: req.gym._id,
            nextBillDate: { $lt: today }
        })
        .populate('membership', 'name months price')
        .sort({ nextBillDate: -1 })
        .skip(parseInt(skip))
        .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            message: totalExpiredMembers > 0 ? "Expired members fetched successfully" : "No Expired Members found",
            members: paginatedExpiredMembers,
            totalMembers: totalExpiredMembers,
            expiredMembersCount: totalExpiredMembers
        });
    } catch(error) {
        console.error("Error in expiredMembers:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
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
        member.membership = membershipId;
        member.nextBillDate = nextBillDate;
        member.lastPayment = today;
        member.status = "Active";
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

export const markAttendance = async (req, res) => {
  try {
    const { id, name } = req.body;
    let member = null;

    if (id) {
      member = await Member.findOne({ _id: id, gym: req.gym._id });
    } else if (name) {
      // Clean the name:
      // 1. Remove timestamp suffix
      // 2. Replace hyphens with spaces
      // 3. Trim whitespace
      // 4. Proper case (capitalize first letter of each word)
      const cleanName = name
        .replace(/-\d+$/, '') // Remove timestamp
        .replace(/-/g, ' ')   // Replace hyphens with spaces
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      // Try exact match first
      member = await Member.findOne({
        gym: req.gym._id,
        name: cleanName
      });

      // If no exact match, try case-insensitive
      if (!member) {
        member = await Member.findOne({
          gym: req.gym._id,
          name: { $regex: new RegExp(`^${cleanName}$`, 'i') }
        });
      }
    }

    if (!member) {
      return res.status(404).json({ 
        success: false, 
        message: 'Member not found',
        searchedName: name,
        cleanedName: name ? name
          .replace(/-\d+$/, '')
          .replace(/-/g, ' ')
          .trim()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ') : null
      });
    }

    member.lastVisit = new Date();
    await member.save();

    res.json({ success: true, memberId: member._id });
  } catch (err) {
    console.error('Error in markAttendance:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};