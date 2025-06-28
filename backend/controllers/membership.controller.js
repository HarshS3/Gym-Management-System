import  Membership  from "../models/membership.model.js";

export const addMembership = async (req, res) => {
    try{
        const {months,price}=req.body;
        const membership=await Membership.findOne({gym:req.gym._id,months});
        if(membership){
            membership.price=price;
            await membership.save();
        }else{
            const newMembership=new Membership({gym:req.gym._id,months,price});
            await newMembership.save();
        }
        res.status(200).json({message:"Membership added successfully"});
    }catch(error){
        console.log(error);
        res.status(500).json({message:"Error in adding membership"});
    }
}

export const getMembership = async (req,res) => {
    const loggedInGymId=req.gym._id;
    const membership=await Membership.find({gym:loggedInGymId});
    if(!membership){
        res.status(404).json({message:"No membership found"});
    }else{
        res.status(200).json(
            {
                "message":"Membership Fetched Successfully",
                membership
            }
        );
    }
}