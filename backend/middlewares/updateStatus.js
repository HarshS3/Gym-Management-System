import Member from "../models/member.model.js";

export const updateExpiredStatus = async (req, res, next) => {
  try {
    const today = new Date();
    await Member.updateMany(
      {
        gym: req.gym._id,
        nextBillDate: { $lt: today },
        status: "Active",
      },
      { status: "Inactive" }
    );
    next();
  } catch (err) {
    console.error("updateExpiredStatus middleware error:", err);
    next();
  }
}; 