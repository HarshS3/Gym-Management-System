# 🏋️ Gym Management System

# [🌐 Live Demo](https://gym-management-system-8qm8.onrender.com/)  
🎓 Started as a learning project during my summer break and evolved into a full-fledged production-ready system—hosted entirely on free-tier cloud services.

## 📌 Overview

A full-stack Gym Management System featuring face recognition attendance, digital billing, real-time analytics, and automation. Designed with a modular architecture to support scalability and ease of use for gym staff.

---

## ✨ Features

### 🔒 Authentication & Security
- JWT-based authentication for protected routes
- Secure login system for admin/staff
- HTTP-only cookies for session management
- Password hashing using bcrypt

### 👥 Member Management
- Face recognition-based attendance
- Auto membership status updates
- Digital ID card generation with PDF export
- Member progress tracking
- Bulk member import/export

### 💳 Billing & Payments
- Razorpay payment gateway integration
- Auto-renewal email reminders
- Invoice generation & payment history
- Flexible pricing & membership plans
- Revenue analytics and entries

### 📊 Analytics Dashboard
- Revenue trends & charts (Chart.js)
- Member distribution insights
- Attendance heatmaps
- Member churn prediction
- Exportable reports
- New registrations this month
- Expiring members list

### 🤖 Automation
- Daily cron job for membership validation
- Automated email reminders:
  - Payment due
  - Expiry notice
- Member details mail on registration
- Invoice mailing on payment

### 🛠️ Equipment Tracker
- Inventory & maintenance tracking
- Maintenance scheduling alerts

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
```
### 🔐 Environment Variables
#### .env (Root)
```bash
# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority&appName=<app-name>

# Email (for nodemailer)
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_app_password

# JWT Secret
JWT_SECRET=your_jwt_secret

# API URLs
REACT_APP_API_BASE_URI=http://localhost:5000
FACE_API_URL=http://localhost:5001

# Server
PORT=5000
NODE_ENV=production

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# AI Keys (optional)
GEMINI_API_KEY=your_gemini_api_key
COHERE_API_KEY=your_cohere_api_key

# Cloudinary
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
```
#### .env (Python)
```bash
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```



### 🚀 Backend Setup
```bash
cd backend
npm install
```
### 🖼️ Frontend Setup
```bash
npm run build
```
### 🧠 Python Face Recognition Server
```bash
cd python
python -m venv venv
source venv/bin/activate 
pip install -r requirements.txt
python faceRecognition.py
```

## ⭐ If you found this project useful, please star the repository!


