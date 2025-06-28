import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema({
    months:{
        type:Number,
        required:true,
        min: 1,
        max: 60
    },
    price:{
        type:Number,
        required:true,
        min: 0
    },
    gym:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"gym",
        required: true
    }
},{timestamps:true})

const Membership = mongoose.model("membership",membershipSchema);

export default Membership;