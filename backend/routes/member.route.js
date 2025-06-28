import express from "express";
import auth from "../middlewares/auth.js";
import { getAllMembers, registerMember, searchedMembers, monthlyMembers, expiringInSevenDays, expiredMembers, inactiveMembers, memberDetail, changeStatus, renewMembership, updateMember } from "../controllers/member.controller.js";

const router=express.Router();

router.get('/get-all-members',auth,getAllMembers)
router.post('/register-member',auth,registerMember)

router.get('/searched-members',auth,searchedMembers)
router.get('/monthly-members',auth,monthlyMembers)
router.get('/expiring-in-week',auth,expiringInSevenDays)
router.get('/expired-members',auth,expiredMembers)
router.get('/inactive-members',auth,inactiveMembers)

router.get('/member-detail/:id',auth,memberDetail)
router.post('/change-status/:id',auth,changeStatus)
router.put('/renew-membership/:id',auth,renewMembership)
router.put('/update-member/:id',auth,updateMember)

export default router;