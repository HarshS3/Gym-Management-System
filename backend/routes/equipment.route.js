import express from "express";
import auth from "../middlewares/auth.js";
import { getEquipments, addEquipment } from "../controllers/equipment.controller.js";

const router = express.Router();

router.get("/", auth, getEquipments);
router.post("/", auth, addEquipment);

export default router; 