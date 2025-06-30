import axios from "axios";
import { config } from "../config/config";

/**
 * Opens Razorpay Checkout for a membership payment.
 *
 * @param {Object} params
 * @param {Object} params.member  – member object containing name, email, phone etc.
 * @param {Object} params.membership – membership object returned from backend (must include price, months, name?)
 * @param {Function} params.onSuccess – callback function to be called on successful payment
 * @returns {Promise<void>}
 */
export const payWithRazorpay = async ({ member, membership, onSuccess }) => {
    console.log("Razorpay key in code:", process.env.REACT_APP_RAZORPAY_KEY_ID);
  if (!membership || typeof membership.price !== "number") {
    alert("Invalid membership data. Unable to initiate payment.");
    return;
  }

  try {
    // 1. Ask backend to create an order 
    const { data } = await axios.post(
      `${config.apiUrl}/payment/create-order`,
      {
        amount: membership.price,
      },
      {
        withCredentials: true,
      }
    );

    if (!data.success) throw new Error("Failed to create Razorpay order");

    const { order } = data; // order.id, order.amount, currency etc.

    // 2. Prepare Razorpay options
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID, // only key_id should be exposed
      amount: order.amount,
      currency: order.currency,
      name: "Gym Membership Payment",
      description: `${membership.months}-month plan`,
      order_id: order.id,
      prefill: {
        name: member.name,
        email: member.email,
        contact: member.phone,
      },
      handler: async (response) => {
        // 3. Verify payment signature with backend
        try {
          await axios.post(
            `${config.apiUrl}/payment/verify`,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              memberId: member._id, // optional extra data
              membershipId: membership._id,
            },
            { withCredentials: true }
          );
          if (typeof onSuccess === 'function') onSuccess(response);
          alert("Payment successful!\nYour membership has been activated.");
        } catch (verifyErr) {
          console.error("Signature verification failed", verifyErr);
          alert("Payment verification failed. Please contact support.");
        }
      },
      theme: {
        color: "#3399cc",
      },
      modal: {
        ondismiss: () => console.log("Razorpay payment popup closed by user"),
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (err) {
    console.error("Error initiating Razorpay payment:", err);
    alert("Unable to start payment. Please try again later.");
  }
};
