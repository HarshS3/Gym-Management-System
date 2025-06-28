import Gym from "../models/gym.model.js";
import jwt from "jsonwebtoken";

const auth = async (req,res,next) => {
    try{
        const token = req.cookies.token;
        if(!token){
            return res.status(401).json({message:"Unauthorized"});
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const gym = await Gym.findById(decoded.id).select("-password");
        if(!gym){
            return res.status(401).json({message:"Unauthorized"});
        }
        req.gym = gym;
        next();
    }catch(err){
        console.log("Error in auth middleware",err);
        res.status(500).json({message:err.message});
    }
}

export default auth;