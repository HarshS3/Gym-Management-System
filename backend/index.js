import connectDB from "./dbConnection/conn.js";
import dotenv from "dotenv";
import express from "express";
import gymRoutes from "./routes/gym.route.js";
import cookieParser from "cookie-parser";
import membershipRoutes from "./routes/membership.route.js";
import memberRoutes from "./routes/member.route.js";
import cors from "cors";
dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin:"http://localhost:3000",
  credentials:true,
}));

app.use("/auth",gymRoutes);
app.use("/plans",membershipRoutes);
app.use("/members",memberRoutes);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1); 
  });

