import express from "express";
import { getAiSuggestions } from "../controllers/ai.controller.js";
const router = express.Router();

router.post("/suggestions",getAiSuggestions);

export default router;