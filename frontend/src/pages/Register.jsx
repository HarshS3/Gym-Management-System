import React, { useState } from "react";
import { motion } from "framer-motion";
import gymBg from "../assets/gym-bg.jpg"; 
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { config } from "../config/config.js";

const Register = () => {

  const [registerFields,setRegisterFields] = useState({
    username:"",
    email:"",
    password:"",  
    confirmPassword:"",
    gymName:"",
    profileImage:`${gymBg}`
  });
  const [isUploading,setIsUploading] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleOnChange = (e,field)=>{
    const newFields = {...registerFields,[field]:e.target.value};
    setRegisterFields(newFields);
    
    // Check if passwords match - use the updated values
    if(field === "confirmPassword" || field === "password"){
      const password = field === "password" ? e.target.value : newFields.password;
      const confirmPassword = field === "confirmPassword" ? e.target.value : newFields.confirmPassword;
      setPasswordsMatch(password === confirmPassword && password.length > 0 && confirmPassword.length > 0);
    }
  }
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const username = registerFields.username.trim();
      const slug = username.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
      const publicId = `${slug}-${Date.now()}`;
      const memberNameContext = `name=${username}`;
      // 1. Request signed signature from backend
      const sigRes = await axios.get(`${config.apiUrl}/cloudinary/signature`, {
        params: { folder: 'members', context: memberNameContext, public_id: publicId },
      });

      const { timestamp, signature, apiKey, cloudName, folder, context, public_id } = sigRes.data;

      // 2. Upload with signature
      const data = new FormData();
      data.append('file', file);
      data.append('api_key', apiKey);
      data.append('timestamp', timestamp);
      data.append('signature', signature);
      data.append('folder', folder);
      if (context) data.append('context', context);
      if (public_id) data.append('public_id', public_id);

      const uploadRes = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, data);

      const imageUrl = uploadRes.data.secure_url;

      setRegisterFields(prev => ({
        ...prev,
        profileImage: imageUrl
      }));
    } catch (error) {
      console.error("Cloudinary upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleRegister = async (e)=>{
    e.preventDefault();
    
    // Validation for all required fields
    if(!registerFields.username.trim()){
      toast.error("Username is required");
      return;
    }
    
    if(!registerFields.gymName.trim()){
      toast.error("Gym name is required");
      return;
    }
    
    if(!registerFields.email.trim()){
      toast.error("Email is required");
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(registerFields.email)){
      toast.error("Please enter a valid email address");
      return;
    }
    
    if(!registerFields.password){
      toast.error("Password is required");
      return;
    }
    
    if(!registerFields.confirmPassword){
      toast.error("Please confirm your password");
      return;
    }
    
    // Password matching validation
    if(registerFields.password !== registerFields.confirmPassword){
      toast.error("Passwords do not match");
      return;
    }
    
    // Profile image validation
    if(!registerFields.profileImage || registerFields.profileImage === gymBg){
      toast.error("Please upload a profile image");
      return;
    }
    
    try{
      const response = await axios.post(`${config.apiUrl}/auth/register`, registerFields);
      if(response.data.success){
        // console.log(response);
        toast.success("Registration successful");
        navigate("/login");
      }
    }catch(error){
      console.error("Registration error:", error);
      if(error.response && error.response.data && error.response.data.message){
        toast.error(error.response.data.message);
      } else {
        toast.error("Registration failed. Please try again.");
      }
    }
  }

  const navigate = useNavigate();
  return (
    <div className="relative w-full min-h-screen overflow-hidden font-poppins">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
            style={{ backgroundImage: `url(${gymBg})` }}
      ></div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-black/40 z-0"></div>

      {/* Centered Register Card */}
      <div className="relative z-10 flex items-center justify-center py-10 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-8 bg-white/10 backdrop-blur-md rounded-xl shadow-xl border border-white/20"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-6">
            Create Your Account
          </h2>

          <form className="space-y-5" onSubmit={handleRegister}>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Username</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-black/60 text-white rounded-lg border border-white/20 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="harsh_shah"
                value={registerFields.username}
                onChange={(e)=>handleOnChange(e,"username")}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Gym Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-black/60 text-white rounded-lg border border-white/20 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Power Fitness Gym"
                value={registerFields.gymName}
                onChange={(e)=>handleOnChange(e,"gymName")}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 bg-black/60 text-white rounded-lg border border-white/20 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
                value={registerFields.email}
                onChange={(e)=>handleOnChange(e,"email")}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-2 bg-black/60 text-white rounded-lg border border-white/20 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                  placeholder="••••••••"
                  value={registerFields.password}
                  onChange={(e)=>handleOnChange(e,"password")}
                />
                <button
                  type="button"
                  onClick={()=>setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 text-sm"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className={`w-full px-4 py-2 bg-black/60 text-white rounded-lg border placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12 ${
                    registerFields.confirmPassword ? 
                      (passwordsMatch ? "border-green-400" : "border-red-400") : 
                      "border-white/20"
                  }`}
                  placeholder="••••••••"
                  value={registerFields.confirmPassword}
                  onChange={(e)=>handleOnChange(e,"confirmPassword")}
                />
                <button
                  type="button"
                  onClick={()=>setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 text-sm"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
              {registerFields.confirmPassword && (
                <div className="mt-1 text-xs">
                  <span className={passwordsMatch ? "text-green-400" : "text-red-400"}>
                    {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
                  </span>
                </div>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Profile Image <span className="text-red-400">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full px-4 py-2 bg-black/60 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={(e)=>handleImageChange(e)}
              />
              {registerFields.profileImage && registerFields.profileImage !== gymBg && (
                <div className="mt-1 text-xs text-green-400">
                  ✓ Profile image uploaded
                </div>
              )}

              {registerFields.profileImage && (
              <div className="mt-4 flex justify-center items-center h-24 w-24 mx-auto">
              {isUploading ? (
                <svg
                  className="animate-spin h-8 w-8 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              ) : (
                registerFields.profileImage && (
                  <img
                    src={registerFields.profileImage}
                    alt="Profile Preview"
                    className="h-24 w-24 object-cover rounded-full border-2 border-blue-400 shadow"
                  />
                )
              )}
            </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-green-400 to-blue-500 hover:from-blue-500 hover:to-green-400 text-white font-semibold rounded-full shadow-md"
            >
              Register
            </motion.button>
          </form>

          <p className="text-sm text-gray-400 mt-4 text-center">
            Already have an account? <span className="text-blue-400 cursor-pointer hover:underline" onClick={()=>{
              navigate("/login");
            }}>Login</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
