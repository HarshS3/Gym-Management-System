import express from "express";
import { addMembership, getMembership } from "../controllers/membership.controller.js";
import auth from "../middlewares/auth.js";

const router=express.Router();

router.post('/add-membership',auth,addMembership);
router.get('/get-membership',auth,getMembership);

export default router;