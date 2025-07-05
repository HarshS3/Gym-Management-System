import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import gymBg from "../assets/gym-bg.jpg";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { config } from "../config/config.js";
import Loader from "../components/Loader";

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const presetEmail = location.state?.email || "";

  const [fields, setFields] = useState({ email: presetEmail, otp: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e, field) => {
    setFields({ ...fields, [field]: e.target.value });
  };

  const handleSendOtp = async () => {
    if (!fields.email) {
      return toast.error("Enter email");
    }
    setIsLoading(true);
    try {
      const res = await axios.post(`${config.apiUrl}/auth/forgot-password/send-otp`, { email: fields.email });
      toast.success(res.data.message);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!fields.email || !fields.otp) {
      return toast.error("Enter email and OTP");
    }
    setIsLoading(true);
    try {
      const res = await axios.post(`${config.apiUrl}/auth/forgot-password/verify-otp`, fields);
      toast.success(res.data.message);
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden font-poppins">
      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(${gymBg})` }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-black/40 z-0" />

      <div className="relative z-10 flex items-center justify-center h-full px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-8 bg-white/10 backdrop-blur-md rounded-xl shadow-xl border border-white/20"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-6">Verify Your Email</h2>

          <form className="space-y-5" onSubmit={(e)=>e.preventDefault()}>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={fields.email}
                onChange={(e)=>handleChange(e,"email")}
                className="w-full px-4 py-2 bg-black/60 text-white rounded-lg border border-white/20 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter OTP"
                value={fields.otp}
                onChange={(e)=>handleChange(e,"otp")}
                className="flex-1 px-4 py-2 bg-black/60 text-white rounded-lg border border-white/20 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleSendOtp}
                className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm"
              >
                Resend
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={handleVerify}
              className="w-full py-3 bg-gradient-to-r from-green-400 to-blue-500 hover:from-blue-500 hover:to-green-400  text-white font-semibold rounded-full shadow-md"
            >
              Verify & Login
            </motion.button>
          </form>
        </motion.div>
      </div>
      {isLoading && <Loader type="spinner" size="medium" color="white" text="Loading..." fullScreen={true} />}
    </div>
  );
};

export default VerifyEmail; 