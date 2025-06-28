import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
    // Basic Information
    name:{
        type:String,
        required:true,
        trim: true
    },
    email:{
        type:String,
        required:true,
        trim: true,
        lowercase: true
    },
    phone:{
        type:String,
        required:true,
        trim: true,
    },
    age:{
        type:Number,
        required:true,
        min: 1,
        max: 120
    },
    gender:{
        type:String,
        required:true,
        enum: ['male', 'female', 'other'],
        trim: true
    },
    address:{
        type:String,
        required:true,
        trim: true
    },
    profileImage:{
        type:String,
        required:true
    },
    
    // Health Metrics
    height: {
        type: Number, // in cm
        required: true,
        min: 100,
        max: 250
    },
    weight: {
        type: Number, // in kg
        required: true,
        min: 20,
        max: 300
    },
    bmi: {
        type: Number,
        min: 10,
        max: 60
    },
    bodyFat: {
        type: Number, // percentage
        min: 0,
        max: 50
    },
    muscleMass: {
        type: Number, // in kg
        min: 0,
        max: 200
    },
    
    // Body Measurements
    bodyMeasurements: {
        chest: { type: Number, min: 50, max: 200 }, // cm
        waist: { type: Number, min: 50, max: 200 }, // cm
        hips: { type: Number, min: 50, max: 200 }, // cm
        biceps: { type: Number, min: 20, max: 100 }, // cm
        thighs: { type: Number, min: 30, max: 150 }, // cm
        calves: { type: Number, min: 20, max: 100 }, // cm
        wrist: { type: Number, min: 10, max: 50 }, // cm
        neck: { type: Number, min: 20, max: 100 }, // cm
        forearm: { type: Number, min: 15, max: 80 }, // cm
        ankle: { type: Number, min: 10, max: 50 } // cm
    },
    
    // Workout Routine
    workoutRoutine: {
        monday: { type: String, default: "Rest" },
        tuesday: { type: String, default: "Rest" },
        wednesday: { type: String, default: "Rest" },
        thursday: { type: String, default: "Rest" },
        friday: { type: String, default: "Rest" },
        saturday: { type: String, default: "Rest" },
        sunday: { type: String, default: "Rest" }
    },
    
    // Personal Trainer
    personalTrainer: {
        name: { type: String, trim: true },
        phone: { type: String, trim: true }
    },
    
    // Notes
    notes: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    
    // Membership Information
    joinDate:{
        type:Date,
        required:true,
        default: Date.now
    },
    lastVisit:{
        type:Date,
        required:true,
        default: Date.now
    },
    gym:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'gym',
        required:true,
    },
    membership:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'membership',
        required:true,
    },
    status:{
        type:String,
        enum: ['Active', 'Inactive'],
        default:"Active",
    },
    lastPayment:{
        type:Date,
        default: Date.now,
    },
    nextBillDate:{
        type:Date,
        required:true,
    }
},{timestamps:true})

const Member = mongoose.model("member",memberSchema);

export default Member;