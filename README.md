# 🏋️ Gym Management System

[🌐 Live Demo](https://gym-management-system-8qm8.onrender.com/)  
🎓 Built during my summer break to help small gyms run like premium franchises—100% hosted on free-tier cloud infrastructure.


## 📌 Overview

A full-stack Gym Management System featuring face recognition attendance, digital billing, real-time analytics, and automation. Designed with a modular architecture to support scalability and ease of use for gym staff.

---

## ✨ Features

### 👥 Member Management
- 🔍 Face recognition-based attendance
- 📆 Auto membership status updates
- 🆔 Digital ID card generation with PDF export
- 📈 Member progress tracking
- 📂 Bulk member import/export

### 💳 Billing & Payments
- 💰 Razorpay payment gateway integration
- ⏰ Auto-renewal email reminders
- 🧾 Invoice generation & payment history
- 📊 Flexible pricing & membership plans

### 📊 Analytics Dashboard
- 💹 Revenue trends & charts (Chart.js)
- 👥 Member distribution insights
- 📆 Attendance heatmaps
- 🔁 Member churn prediction
- 📤 Exportable reports

### 🤖 Automation
- 🔄 Daily cron job for membership validation
- 📧 Automated email reminders:
  - Payment due
  - Expiry notice
  - Announcements
- 📝 Attendance log maintenance

### 🛠️ Equipment Tracker
- 📦 Inventory & maintenance tracking
- 🛠️ Maintenance scheduling alerts
- 📉 Usage analytics
- 📱 QR-code based equipment access (beta)

---

## 🧰 Tech Stack

| Layer         | Technologies                                                                 |
|---------------|------------------------------------------------------------------------------|
| **Frontend**  | React.js, Tailwind CSS, Chart.js, Face-api.js                                |
| **Backend**   | Node.js, Express.js, MongoDB, Mongoose, JWT, Node-Cron                       |
| **AI Service**| Python (Flask), face_recognition, Docker, Cloudinary                         |
| **DevOps**    | GitHub Actions, Docker, Render (Free Tier), Cloudinary CDN                   |

---

## ⚙️ Local Development

### 🔧 Prerequisites
- Node.js, Python 3.8+, MongoDB Atlas account, Cloudinary account, Razorpay account

### 📁 Clone the Repository
```bash
git clone https://github.com/your-username/gym-management-system.git
cd gym-management-system
