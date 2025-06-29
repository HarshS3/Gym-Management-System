import connectDB from "./dbConnection/conn.js";
import dotenv from "dotenv";
import express from "express";
import gymRoutes from "./routes/gym.route.js";
import cookieParser from "cookie-parser";
import membershipRoutes from "./routes/membership.route.js";
import memberRoutes from "./routes/member.route.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

if(process.env.NODE_ENV === 'development'){
app.use(cors({
  origin: ["http://localhost:3000"],
  credentials: true,
}));
}

// API Routes
app.use("/auth", gymRoutes);
app.use("/plans", membershipRoutes);
app.use("/members", memberRoutes);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../frontend/build')));

  
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});


connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); 
  });

