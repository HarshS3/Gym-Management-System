import cron from "node-cron";
import nodemailer from "nodemailer";
import Member from "../models/member.model.js"; // Update with your actual path
import dotenv from "dotenv";
dotenv.config();

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  },
  secure: true,
  port: 465
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP connection error:', error);
  } else {
    console.log('✅ SMTP Server is ready to send emails');
  }
});

// Format date (optional helper)
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ⏰ Run every day at 9 AM
cron.schedule("0 9 * * *", async () => {
  console.log("🔔 Checking for memberships expiring today and in 7 days...");

  try {
    // Get today's date (start and end of day)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Get date exactly 7 days from now (start and end of that day)
    const sevenDaysStart = new Date();
    sevenDaysStart.setDate(sevenDaysStart.getDate() + 7);
    sevenDaysStart.setHours(0, 0, 0, 0);
    const sevenDaysEnd = new Date(sevenDaysStart);
    sevenDaysEnd.setHours(23, 59, 59, 999);

    // Find and update members whose membership expired today
    const expiredMembers = await Member.find({
      status: "Active",
      nextBillDate: {
        $lt: todayStart
      }
    });

    // Update status to Inactive for expired members
    for (const member of expiredMembers) {
      await Member.findByIdAndUpdate(member._id, { status: "Inactive" });
      console.log(`🔄 Updated status to Inactive for member: ${member.name}`);
    }

    // Find members expiring today
    const expiringToday = await Member.find({
      status: "Active",
      nextBillDate: {
        $gte: todayStart,
        $lte: todayEnd
      }
    }).populate('membership', 'name months price');

    // Find members expiring in exactly 7 days
    const expiringInSevenDays = await Member.find({
      status: "Active",
      nextBillDate: {
        $gte: sevenDaysStart,
        $lte: sevenDaysEnd
      }
    }).populate('membership', 'name months price');

    console.log(`Found ${expiringToday.length} members expiring today, ${expiringInSevenDays.length} members expiring in 7 days, and updated ${expiredMembers.length} expired memberships to Inactive`);

    // Send emails to members expiring today
    for (const member of expiringToday) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: member.email,
          subject: "⚠️ Your Gym Membership Expires Today!",
          html: `<h3>Hi ${member.name},</h3>
          <p>Your gym membership expires <strong>today</strong>.</p>
          <p>To avoid any interruption in your fitness journey, please visit us today to renew your membership.</p>
          <p>Current plan details:<br>
          Plan: ${member.membership.name}<br>
          Duration: ${member.membership.months} months<br>
          Price: ₹${member.membership.price}</p>`,
        });
        console.log(`✅ Expiry notification sent to ${member.email} (expires today)`);
      } catch (error) {
        console.error(`❌ Failed to send expiry notification to ${member.email}:`, error);
      }
    }

    // Send emails to members expiring in 7 days
    for (const member of expiringInSevenDays) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: member.email,
          subject: "⏳ Gym Membership Expiring in 7 Days",
          html: `<h3>Hi ${member.name},</h3>
          <p>Your gym membership will expire on <strong>${formatDate(member.nextBillDate)}</strong>.</p>
          <p>To ensure uninterrupted access to our facilities, please plan to renew your membership before the expiry date.</p>
          <p>Current plan details:<br>
          Plan: ${member.membership.name}<br>
          Duration: ${member.membership.months} months<br>
          Price: ₹${member.membership.price}</p>`,
        });
        console.log(`✅ Reminder sent to ${member.email} (expires in 7 days)`);
      } catch (error) {
        console.error(`❌ Failed to send reminder to ${member.email}:`, error);
      }
    }

    console.log('✅ Finished sending all notifications');
  } catch (err) {
    console.error("❌ Cron job error:", err);
  }
});