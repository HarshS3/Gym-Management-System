import dotenv from "dotenv";
import connectDB from "../dbConnection/conn.js";
import Member from "../models/member.model.js";

dotenv.config();

(async () => {
  try {
    await connectDB();
    const today = new Date();

    // Set inactive where nextBillDate passed
    const res1 = await Member.updateMany({ nextBillDate: { $lt: today } }, { status: "Inactive" });

    // Set active where nextBillDate in future
    const res2 = await Member.updateMany({ nextBillDate: { $gte: today } }, { status: "Active" });

    console.log(`Statuses updated. Inactive: ${res1.modifiedCount}, Active: ${res2.modifiedCount}`);
  } catch (err) {
    console.error("Status update script error:", err);
  } finally {
    process.exit();
  }
})(); 