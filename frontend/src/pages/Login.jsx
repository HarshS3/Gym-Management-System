import React,{useState} from "react";
import { motion } from "framer-motion";
import gymBg from "../assets/gym-bg.jpg"; 
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
const Login = () => {
  const navigate = useNavigate();
  const [loginFields,setLoginFields] = useState({
    email:"",
    password:"",
  });
  const handleOnChange = (e,field)=>{
    setLoginFields({...loginFields,[field]:e.target.value});
  }
  const handleLogin = async (e)=>{
    e.preventDefault();
    try{
      const response = await axios.post("http://localhost:5000/auth/login",loginFields,{withCredentials:true});
      if(response.data.success){
        console.log(response.data);
        localStorage.setItem("gymName",response.data.gym.gymName);
        localStorage.setItem('isLoggedIn','true');
        // Dispatch custom event to notify App.js about the login state change
        window.dispatchEvent(new Event('loginStateChanged'));
        navigate("/dashboard");
        toast.success(response.data.message);
      }
    }
    catch(error){
      toast.error(error.response.data.message);
    }
  }
  return (
    <div className="relative w-full h-screen overflow-hidden font-poppins">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${gymBg})` }}
      ></div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-black/40 z-0"></div>

      {/* Centered Login Card */}
      <div className="relative z-10 flex items-center justify-center h-full px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-8 bg-white/10 backdrop-blur-md rounded-xl shadow-xl border border-white/20"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-6">
            Welcome Back
          </h2>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 bg-black/60 text-white rounded-lg border border-white/20 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
                value={loginFields.email}
                onChange={(e)=>{
                  handleOnChange(e,"email");
                }}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 bg-black/60 text-white rounded-lg border border-white/20 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                value={loginFields.password}
                onChange={(e)=>{
                  handleOnChange(e,"password");
                }}
              />

            <div className="text-right">
            <span className="text-sm text-blue-400 cursor-pointer hover:underline" onClick={()=>{
              navigate("/forgot-password");
            }}>
                Forgot Password?
            </span>
            </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-green-400 to-blue-500 hover:from-blue-500 hover:to-green-400 text-white font-semibold rounded-full shadow-md"
            >
              Login
            </motion.button>
          </form>

          <p className="text-sm text-gray-400 mt-4 text-center">
            Don't have an account? <span className="text-blue-400 cursor-pointer hover:underline" onClick={()=>{
              navigate("/register");
            }}>Register</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
