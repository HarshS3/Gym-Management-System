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
import "./utils/emailCron.js";
import analyticsRouter from "./routes/analytics.route.js";
import paymentRoutes from "./routes/payment.route.js";
import exportPdf  from "./utils/pdfExort.js";
import equipmentRoutes from "./routes/equipment.route.js";
import aiRoutes from "./routes/ai.route.js";
import cloudinaryRoutes from "./routes/cloudinary.route.js";
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Proxy for Python Face API – must be registered BEFORE body parsers so the
// raw request stream reaches the proxy intact (otherwise express.json would
// consume it and the proxied request body would be empty).
app.use(
  '/face-api',
  createProxyMiddleware({
    target: process.env.FACE_API_URL || 'http://127.0.0.1:5001',
    changeOrigin: true,
    pathRewrite: { '^/face-api': '' },
    timeout: 5 * 60 * 1000,
    proxyTimeout: 5 * 60 * 1000,
    onError: (err, req, res) => {
      console.error('Face API proxy error:', err.message);
      res.status(500).json({ success: false, message: 'Face API service unavailable' });
    },
  })
);

// JSON parser & cookies for other API routes
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5000"],
  credentials: true,
}));

// API Routes
app.use("/auth", gymRoutes);
app.use("/plans", membershipRoutes);
app.use("/members", memberRoutes);
app.use("/analytics", analyticsRouter);
app.use("/payment", paymentRoutes);
app.use("/equipment", equipmentRoutes);
app.use("/ai", aiRoutes);
app.use("/cloudinary", cloudinaryRoutes);
app.get("/export-pdf", exportPdf);

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

