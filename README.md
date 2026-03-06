# W-SAFE - Women Safety Application

A comprehensive and professional women safety application with real-time location sharing, emergency SOS alerts, and quick access to helpline numbers.

## 🎯 Features

- **🚨 Emergency SOS**: One-touch emergency alerts to notify trusted contacts with location
- **📍 Live Location Sharing**: Real-time location tracking and sharing with emergency contacts
- **☎️ Helpline Numbers**: Quick access to emergency services and women safety helplines
- **👥 Emergency Contacts**: Manage and maintain list of trusted emergency contacts
- **🔐 Secure Authentication**: Email-based OTP verification for secure signup
- **📧 Email Notifications**: Instant email alerts to emergency contacts during SOS
- **💼 Professional Dashboard**: Intuitive and user-friendly interface
- **🛡️ Safety Tips**: Comprehensive safety guidelines and best practices

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Gmail account with App Password

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Setup environment variables**
```bash
cp .env.example .env
```

3. **Start the server**
```bash
npm start
```

> **Note:** The browser geolocation API requires a secure context (HTTPS or localhost) and explicit permission. If you see “Location permission denied,” make sure you're on `https://` or `http://localhost` and allow location access in your browser settings.


## 📖 API Documentation

### Authentication
- `POST /api/send-otp` - Send OTP to email
- `POST /api/signup` - Create new account
- `POST /api/login` - User login
- `POST /api/change-password` - Change password
- `GET /api/logout` - Logout user

### Emergency Contacts
- `POST /api/save-email` - Save emergency contact
- `GET /api/get-emails?owner=email` - Get user's emergency contacts
- `DELETE /api/delete-email/:id` - Delete emergency contact

### SOS
- `POST /api/sos` - Send SOS alert to contacts

## 🔐 Security Features

✅ Input validation and sanitization  
✅ Email verification via OTP  
✅ Password hashing with bcrypt  
✅ Security headers (CSP, X-Frame-Options)  
✅ XSS protection  
✅ Error handling with secure messages

## 📊 Project Structure

```
src/
├── controllers/          # Business logic
├── models/              # Database schemas
├── routes/              # API endpoints
├── middleware/          # Custom middleware
├── utils/               # Helper functions
├── public/              # Frontend assets
├── views/               # HTML templates
└── config.js            # Configuration
```

## 🛠️ Tech Stack

- **Backend**: Express.js, Node.js
- **Database**: MongoDB, Mongoose
- **Authentication**: Bcrypt, OTP
- **Email**: Nodemailer
- **Frontend**: HTML5, CSS3, JavaScript
- **Security**: Helmet, CSP, Input Sanitization

## 📞 Emergency Helplines

- 🚨 112 - National Emergency
- 🚔 100 - Police Emergency
- 🚑 108 - Ambulance Service
- 👩 181 - Women Helpline
- 🛡️ 1091 - Women Police

## 📝 License

MIT License - See LICENSE file for details

## 🙏 Support

For support: wsafe181@gmail.com

---

**Stay Safe! Your safety is our priority.** 🛡️
