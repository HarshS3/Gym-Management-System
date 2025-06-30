import express from 'express';
import auth from '../middlewares/auth.js';
import  {createOrder, verifyPayment, getPayments}  from '../controllers/payment.controller.js';

const router = express.Router();

router.post('/create-order', auth, createOrder);
router.post('/verify', auth, verifyPayment);
router.get('/records', auth, getPayments);

export default router;