import  Membership  from "../models/membership.model.js";

export const addMembership = async (req, res) => {
    try{
        const {months,price}=req.body;
        console.log('Adding membership with data:', { months, price, gymId: req.gym._id });
        
        let membership=await Membership.findOne({gym:req.gym._id,months});
        console.log('Existing membership found:', membership);
        
        if(membership){
            membership.price=price;
            await membership.save();
            console.log('Updated existing membership:', membership);
        }else{
            membership=new Membership({gym:req.gym._id,months,price});
            await membership.save();
            console.log('Created new membership:', membership);
        }
        res.status(200).json({
            success: true,
            message: "Membership added successfully",
            membership
        });
    }catch(error){
        console.error('Error in addMembership:', error);
        res.status(500).json({
            success: false,
            message: "Error in adding membership"
        });
    }
}

export const getMembership = async (req,res) => {
    try {
        const loggedInGymId=req.gym._id;
        console.log('Fetching memberships for gym:', loggedInGymId);
        
        const membership=await Membership.find({gym:loggedInGymId});
        console.log('Found memberships:', membership);
        
        if(!membership || membership.length === 0){
            return res.status(200).json({
                success: true,
                message: "No membership found",
                membership: []
            });
        }
        res.status(200).json({
            success: true,
            message: "Membership Fetched Successfully",
            membership
        });
    } catch (error) {
        console.error('Error in getMembership:', error);
        res.status(500).json({
            success: false,
            message: "Error in fetching memberships"
        });
    }
}