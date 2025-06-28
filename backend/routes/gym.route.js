import express from "express";
import {registerGym,loginGym,sendOtp,verifyOtp,resetPassword,logoutGym} from "../controllers/gym.controller.js";
import auth from "../middlewares/auth.js";
 
const router = express.Router();

router.post("/register",registerGym);
router.post("/login",loginGym);  
router.post("/forgot-password/send-otp",sendOtp);
router.post("/forgot-password/verify-otp",verifyOtp);
router.post("/forgot-password/reset-password",resetPassword);
router.post("/logout",logoutGym);
router.get("/verify", auth, (req, res) => {
  res.status(200).json({ success: true, message: "Session is valid" });
});

export default router;