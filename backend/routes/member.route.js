import express from "express";
import auth from "../middlewares/auth.js";
import { getAllMembers, registerMember, searchedMembers, monthlyMembers, expiringInSevenDays, expiredMembers, inactiveMembers, memberDetail, changeStatus, renewMembership, updateMember } from "../controllers/member.controller.js";
import { updateExpiredStatus } from "../middlewares/updateStatus.js";

const router=express.Router();

router.get('/get-all-members', auth, updateExpiredStatus, getAllMembers)
router.post('/register-member',auth,registerMember)

router.get('/searched-members', auth, updateExpiredStatus, searchedMembers)
router.get('/monthly-members', auth, updateExpiredStatus, monthlyMembers)
router.get('/expiring-in-week', auth, updateExpiredStatus, expiringInSevenDays)
router.get('/expired-members', auth, updateExpiredStatus, expiredMembers)
router.get('/inactive-members', auth, updateExpiredStatus, inactiveMembers)

router.get('/member-detail/:id',auth,memberDetail)
router.post('/change-status/:id',auth,changeStatus)
router.put('/renew-membership/:id',auth,renewMembership)
router.put('/update-member/:id',auth,updateMember)

export default router;