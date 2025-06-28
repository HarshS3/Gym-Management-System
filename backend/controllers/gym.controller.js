import Gym from "../models/gym.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

export const registerGym = async (req,res) => {
    try{
        const {username,email,password,gymName,profileImage} = req.body;

        const isExist = await Gym.findOne({username});
        if(isExist){
            res.status(400).json({message:"Gym already exists. Please try with different username"});
        }else{
            const hashedPassword = await bcrypt.hash(password,10);
            const newGym = new Gym({username,email,password:hashedPassword,gymName,profileImage});
            await newGym.save();
            res.status(201).json({message:"Gym registered successfully",success:true});
        }
    }catch(err){
        res.status(500).json({message:err.message});
    }
}

const cookieOptions = {
    httpOnly:true,
    secure:true,
    sameSite:"lax",
    maxAge:3600000
}

export const loginGym = async (req,res) => {
    try{
        const {email,password} = req.body;
        const gym = await Gym.findOne({email});
        if(!gym) {
            return res.status(400).json({message:"Invalid Credentials"});
        }
        
        const isPasswordValid = await bcrypt.compare(password, gym.password);
        
        if(isPasswordValid){
            const token = jwt.sign({id:gym._id},process.env.JWT_SECRET,{expiresIn:"1h"});
            res.cookie("token",token,cookieOptions);
            res.status(200).json({message:"Gym logged in successfully",gym,success:true,token});
        }else{
            res.status(400).json({message:"Invalid Credentials"});
        }
    }catch(err){
        console.log("Error in loginGym",err);
        res.status(500).json({message:err.message});
    }
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    },

});

export const sendOtp = async (req,res) => {
    try{
        const {email} = req.body;
        const gym = await Gym.findOne({email});
        if(gym){
            const buffer = crypto.randomBytes(4);
            const token = buffer.readUint32BE(0) % 900000 + 100000;
            gym.resetPasswordTokenOtp = token;
            gym.resetPasswordExpiresOtp = Date.now() + 3600000; // 1 hr expiry
            await gym.save();

            const mailOptions = {
                from:process.env.EMAIL_USER,
                to:email,
                subject:"Password Reset",
                text:`Your password reset OTP is ${token} and valid for 1 hour`
            }
            
            transporter.sendMail(mailOptions,(error,info)=>{
                if(error){
                    console.log("Error in sending email",error);
                    res.status(500).json({message:"Error in sending email"});
                }else{
                    // console.log("Email sent",info.response);
                    res.status(200).json({message:"Password reset OTP sent to your email",token});
                }
            });
            
        }else{
            res.status(400).json({message:"Email not found"});
        }
    }catch(err){
        console.log("Error in sendOtp",err);
        res.status(500).json({message:err.message});
    }
}

export const verifyOtp = async (req,res) => {
    try{
        const {email,otp} = req.body;
        const gym = await Gym.findOne({
            email,
            resetPasswordTokenOtp:otp,
            resetPasswordExpiresOtp:{$gt:Date.now()}
        });
        if(gym){
            res.status(200).json({message:"OTP verified successfully"});
        }else{
            res.status(400).json({message:"Invalid OTP"});
        }
    }catch(err){
        console.log("Error in verifyOtp",err);
        res.status(500).json({message:err.message});
    }
}

export const resetPassword = async (req,res) => {
    try{
        const {email,newPassword} = req.body;
        const gym = await Gym.findOne({email}); // Returns the Gym Object
        if(gym){
            const hashedPassword = await bcrypt.hash(newPassword,10);
            gym.password = hashedPassword;
            gym.resetPasswordTokenOtp = null;
            gym.resetPasswordExpiresOtp = null;
            await gym.save();
            res.status(200).json({message:"Password reset successfully"});
        }else{
            res.status(400).json({message:"Email not found"});
        }
    }catch(err){
        console.log("Error in resetPassword",err);
        res.status(500).json({message:err.message});
    }
}

export const logoutGym = async (req,res) => {
    res.clearCookie("token",cookieOptions);
    res.status(200).json({message:"Gym logged out successfully"});
}