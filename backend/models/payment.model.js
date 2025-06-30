import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: "member", required: true },
  membership: { type: mongoose.Schema.Types.ObjectId, ref: "membership", required: true },
  orderId: { type: String, required: true },
  paymentId: { type: String, required: true },
  amount: { type: Number, required: true }, // amount in paise
  currency: { type: String, default: "INR" },
  method: { type: String },
  status: { type: String, default: "captured" },
}, { timestamps: true });

const Payment = mongoose.model("payment", paymentSchema);

export default Payment; 