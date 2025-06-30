import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  muscleGroup: { type: String, required: true },
  status: {
    type: String,
    enum: ["active", "maintenance", "inactive"],
    default: "active",
  },
  location: { type: String, default: "" },
  quantity: { type: Number, default: 1 },
  gym: { type: mongoose.Schema.Types.ObjectId, ref: "gym", required: true },
}, { timestamps: true });

const Equipment = mongoose.model("equipment", equipmentSchema);

export default Equipment; 