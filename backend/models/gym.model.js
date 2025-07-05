import mongoose from "mongoose";

const gymSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        trim: true,
        lowercase: true,
        unique:true
    },
    username:{
        type:String,
        required:true,
        trim: true,
        unique: true
    },
    password:{
        type:String,
        required:true
    },
    profileImage:{
        type:String,
        required:true
    },
    gymName:{
        type:String,
        required:true,
        trim: true
    },
    resetPasswordToken:{
        type:String,
        default:null
    },
    resetPasswordExpires:{
        type:Date,
    },
    resetPasswordTokenOtp:{
        type:Number,
        default:null
    },
    resetPasswordExpiresOtp:{
        type:Date,
        default:null
    },
    isEmailVerified:{
        type:Boolean,
        default:false
    }
},{timestamps:true})

const Gym = mongoose.model("gym",gymSchema);

export default Gym;