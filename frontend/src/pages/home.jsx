import React from "react";
import { motion } from "framer-motion";
import gymBg from "../assets/gym-bg.jpg"; 
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="relative w-full h-screen overflow-hidden font-poppins">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${gymBg})` }}
      ></div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-black/40 z-0"></div>

      {/* Center Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center h-full px-4">
        {/* Title */}
        <motion.h1
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-wide"
          >
            Gym Management System
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-lg md:text-xl text-gray-300 mb-16"
          >
            Track Members. Manage Equipment. Empower Fitness.
          </motion.p>

          {/* Button with Gradient Border */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt p-[2px] rounded-full bg-gradient-to-r from-green-400 to-blue-500 inline-block"
          >
            <button className="px-8 py-3 bg-black rounded-full text-white text-lg font-semibold w-full hover:bg-white hover:text-black"onClick={()=>{
              navigate("/login");
            }}>
              Get Started
            </button>
          </motion.div>
      </div>
    </div>
  );
};

export default Home;
