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
