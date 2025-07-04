import express from "express";
import { getUploadSignature } from "../controllers/cloudinary.controller.js";

const router = express.Router();

// Public endpoint – no auth required because API_KEY/SECRET stay server-side
router.get("/signature", getUploadSignature);

export default router; 