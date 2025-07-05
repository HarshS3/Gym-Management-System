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

// Increase timeout so large face-recognition requests don't cause 504s
const PROXY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// Proxy for Python Face API – must be registered BEFORE body parsers so the
// raw request stream reaches the proxy intact (otherwise express.json would
// consume it and the proxied request body would be empty).
app.get('/face-api/test', (req, res) => {
  res.send('Proxy route is active');
});

app.use(
  '/face-api',
  createProxyMiddleware({
    target: 'http://localhost:5001',
    changeOrigin: true,
    pathRewrite: {
      '^/face-api': '', // ✅ crucial line
    },
    timeout: 5 * 60 * 1000,
    proxyTimeout: 5 * 60 * 1000,
    limit: '10mb',
    onError: (err, req, res) => {
      console.error('❌ Face API proxy error:', err.message);
      res.status(500).json({
        success: false,
        message: 'Face recognition service error: ' + err.message,
      });
    },
  })
);
// Increase body parser limit for other routes
app.use(express.json({ limit: '10mb' }));
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
console.log('FACE_API_URL at runtime:', process.env.FACE_API_URL);
console.log('Proxy target:', process.env.FACE_API_URL);

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

