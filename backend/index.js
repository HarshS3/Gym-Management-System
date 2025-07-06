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
// raw image data can be proxied correctly
app.get('/face-api/test', (req, res) => {
    console.log('Test route hit');
    res.send('Face API proxy is working');
});

// Debug middleware for face-api requests
app.use('/face-api', (req, res, next) => {
    console.log('Face API Request:', {
        method: req.method,
        path: req.path,
        headers: req.headers,
        body: req.method === 'GET' ? undefined : '[BODY]' // Don't log binary data
    });
    next();
});

app.use(
    '/face-api',
    createProxyMiddleware({
        target: 'http://localhost:5001',
        changeOrigin: true,
        onProxyReq: (proxyReq, req, res) => {
            console.log('Proxying request to Python:', proxyReq.path);
        },
        onProxyRes: (proxyRes, req, res) => {
            console.log('Received response from Python:', proxyRes.statusCode);
        },
        onError: (err, req, res) => {
            console.error('Proxy Error:', err);
            res.status(500).send('Proxy Error: ' + err.message);
        },
        pathRewrite: {
            '^/face-api': '', // ✅ crucial line
        },
        proxyTimeout: 120000, // 2 minutes
        timeout: 120000, // 2 minutes
        secure: false, // don't verify SSL certs
        ws: true, // enable websocket proxy
        xfwd: true, // add x-forward headers
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

const FACE_API_URL = process.env.FACE_API_URL || 'http://localhost:5001';
console.log('FACE_API_URL at runtime:', FACE_API_URL);
console.log('Proxy target:', FACE_API_URL);

// Check if Python server is available
const checkPythonServer = async () => {
    try {
        const response = await fetch(`${FACE_API_URL}/test`);
        if (response.ok) {
            console.log('✅ Python Face Recognition server is running');
        } else {
            console.error('❌ Python Face Recognition server returned error:', response.status);
        }
    } catch (error) {
        console.error('❌ Python Face Recognition server is not reachable:', error.message);
        console.log('Please ensure Python server is running on port 5001');
    }
};

connectDB()
  .then(() => {
    app.listen(PORT, async () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
      await checkPythonServer();
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); 
  });

