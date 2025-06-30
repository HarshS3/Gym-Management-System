import React, { useState } from "react";
import { motion } from "framer-motion";
import gymBg from "../assets/gym-bg.jpg"; 
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import axios from "axios";
import { toast } from "react-hot-toast";
import { config } from "../config/config.js";

const ForgotPassword = () => {
  const [emailSubmit, setEmailSubmit] = useState(false);
  const [otpValidation, setOtpValidation] = useState(false);
  const [contentVal,setContentVal] = useState("Send OTP");
  const [isLoading,setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [forgotPasswordFields,setForgotPasswordFields] = useState({
    email:"",
    otp:"",
    newPassword:"" 
  });

  const handleOnChange = (e,field)=>{
    setForgotPasswordFields({...forgotPasswordFields,[field]:e.target.value});
  }

const sendOtp = async () => {
  setIsLoading(true);
  try{
    const response = await axios.post(`${config.apiUrl}/auth/forgot-password/send-otp`,forgotPasswordFields);
    setEmailSubmit(true);
    setContentVal("Verify OTP");
    toast.success(response.data.message);
    setIsLoading(false);
  }catch(error){
      console.error("Error sending OTP:", error);
      toast.error(error.response.data.message);
      setIsLoading(false);
    }
}

const verifyOtp = async () => {
  setIsLoading(true);
  try{
    const response = await axios.post(`${config.apiUrl}/auth/forgot-password/verify-otp`,forgotPasswordFields);
    setOtpValidation(true);
    setContentVal("Reset Password");
    toast.success(response.data.message);
    setIsLoading(false);
  }catch(error){
    console.error("Error verifying OTP:", error);
    toast.error(error.response.data.message);
    setIsLoading(false);
  }
}

const resetPassword = async () => {
  setIsLoading(true);
  try{
    const response = await axios.post(`${config.apiUrl}/auth/forgot-password/reset-password`,forgotPasswordFields);
    toast.success(response.data.message);
    navigate("/login");
    setIsLoading(false);
  }catch(error){
    console.error("Error resetting password:", error);
    toast.error(error.response.data.message);
    setIsLoading(false);
  }
}

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!emailSubmit){
      sendOtp();
    }else if(emailSubmit && !otpValidation){
      verifyOtp();
    }else if(otpValidation){
      resetPassword();
    }
  };


  return (
    <div className="relative w-full h-screen overflow-hidden font-poppins">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${gymBg})` }}
      ></div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-black/40 z-0"></div>

      {/* Centered Card */}
      <div className="relative z-10 flex items-center justify-center h-full px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-8 bg-white/10 backdrop-blur-md rounded-xl shadow-xl border border-white/20"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-6">
            Reset Password
          </h2>

          <p className="text-sm text-gray-300 text-center mb-6">
            Enter your registered email. We'll send you a reset link.
          </p>

          <form className="space-y-5">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 bg-black/60 text-white rounded-lg border border-white/20 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
                value={forgotPasswordFields.email}
                onChange={(e)=>handleOnChange(e,"email")}
              />
            </div>

            {emailSubmit && (
              <div>
              <label className="block text-sm text-gray-300 mb-1">
                Enter OTP
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-black/60 text-white rounded-lg border border-white/20 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter OTP"
                value={forgotPasswordFields.otp}
                onChange={(e)=>handleOnChange(e,"otp")}
              />
            </div>
            )}

            {otpValidation && (
              <div>
              <label className="block text-sm text-gray-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-2 bg-black/60 text-white rounded-lg border border-white/20 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter New Password"
                value={forgotPasswordFields.newPassword}
                onChange={(e)=>handleOnChange(e,"newPassword")}
              />
            </div>
            )}

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              onClick={(e)=>handleSubmit(e)}
              className="w-full py-3 bg-gradient-to-r from-green-400 to-blue-500 hover:from-blue-500 hover:to-green-400  text-white font-semibold rounded-full shadow-md"
            >
              {contentVal}
            </motion.button>
          </form>

          <p className="text-sm text-gray-400 mt-4 text-center">
            Remember your password?{" "}
            <span className="text-blue-400 cursor-pointer hover:underline" onClick={()=>{
              navigate("/login");
            }}>
              Login
            </span>
          </p>
        </motion.div>
      </div>
      {isLoading && <Loader type="spinner" size="medium" color="white" text="Loading..." fullScreen={true} />}
    </div>
  );
};

export default ForgotPassword;
