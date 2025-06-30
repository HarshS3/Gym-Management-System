import express from "express";
import auth from "../middlewares/auth.js";
import { 
    getMembershipDistribution, 
    getMonthlyRevenue, 
    getMembershipStatus 
} from "../controllers/analytics.controller.js";

const router = express.Router();

router.get('/membership-distribution', auth, getMembershipDistribution);
router.get('/monthly-revenue', auth, getMonthlyRevenue);
router.get('/membership-status', auth, getMembershipStatus);

export default router; 