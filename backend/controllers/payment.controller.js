import axios from 'axios';
import Razorpay from 'razorpay';

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});


export const createOrder = async (req, res) => {
    try {
        const option = {
            amount: Number(req.body.amount * 100),
            currency: "INR",
            receipt:`receipt_${Date.now()}`,
        }
        const order = await razorpayInstance.orders.create(option);
        res.status(200).json({
            success:true,
            order
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success:false,
            message:"Internal server error"
        });
    }
}

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Validate input
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: "Missing payment details" });
        }

        const crypto = await import('crypto');
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generatedSignature = hmac.digest('hex');

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Signature mismatch' });
        }

        // TODO: you can create a payment record or update member status here

        return res.status(200).json({ success: true, message: 'Payment verified' });
    } catch (error) {
        console.error('verifyPayment error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const getPayments = async (req, res) => {
    try {
        // Fetch all members for the current gym
        const members = await (await import('../models/member.model.js')).default.find({ gym: req.gym._id }).select('_id');
        const memberIds = members.map(m => m._id);

        const Payment = (await import('../models/payment.model.js')).default;

        const { skip = 0, limit = 10 } = req.query;
        const numericSkip = parseInt(skip);
        const numericLimit = parseInt(limit);

        const filter = { member: { $in: memberIds } };

        const total = await Payment.countDocuments(filter);

        const payments = await Payment.find(filter)
            .populate({ path: 'member', select: 'name' })
            .populate({ path: 'membership', select: 'name months price' })
            .sort({ createdAt: -1 })
            .skip(numericSkip)
            .limit(numericLimit);

        res.status(200).json({ success: true, payments, total });
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
