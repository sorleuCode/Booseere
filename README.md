# Booseere Multipurpose Cooperative Management System

A comprehensive web application for managing cooperative societies, built with React (frontend) and Node.js/Express (backend).

## 🚀 Features

### Core Functionality
- **Member Management**: Register, update, and manage cooperative members
- **Contribution Tracking**: Record and monitor member contributions
- **Loan Management**: Apply for, approve, and track loan repayments
- **Admin Dashboard**: Real-time statistics and management tools
- **Contact System**: Contact form with email notifications
- **Authentication**: Secure admin login with JWT tokens

### Advanced Features
- **Real-time Dashboard**: Auto-updating statistics every 5 minutes
- **File Uploads**: Cloudinary integration for member photos
- **Email Notifications**: Automated emails for various events
- **Data Export**: CSV export functionality for reports
- **Responsive Design**: Mobile-friendly interface

## 🛠️ Tech Stack

### Frontend
- **React 19** with Vite
- **React Router** for navigation
- **Axios** for API calls
- **CSS** for styling
- **Cloudinary** for image uploads (member photos)

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Nodemailer** for emails
- **bcryptjs** for password hashing

## 📋 Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Gmail account (for email notifications)
- Cloudinary account (for image uploads)
  - Create account at https://cloudinary.com
  - Get your Cloud Name and create an upload preset

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd cooperative
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 🔧 Environment Configuration

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/booseere_records

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
ADMIN_EMAIL=admin@yourdomain.com

# Frontend
FRONTEND_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=5242880
```

## 🌐 Deployment

### Vercel Deployment

#### Backend Deployment
1. Push backend code to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

#### Frontend Deployment
1. Update `vercel.json` with your backend URL
2. Push frontend code to GitHub
3. Connect to Vercel
4. Set `VITE_API_BASE_URL` environment variable
5. Deploy

### Environment Variables for Vercel

#### Backend
- `MONGODB_URI`
- `JWT_SECRET`
- `EMAIL_USER`
- `EMAIL_PASSWORD`
- `ADMIN_EMAIL`
- `FRONTEND_URL`

#### Frontend
- `VITE_API_BASE_URL` (your deployed backend URL)
- `VITE_CLOUDINARY_CLOUD_NAME` (your Cloudinary cloud name)
- `VITE_CLOUDINARY_UPLOAD_PRESET` (your Cloudinary upload preset)

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register-admin` - Register admin
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current admin

### Members
- `GET /api/members` - Get all members (admin)
- `POST /api/members` - Create member (admin)
- `PUT /api/members/:id` - Update member (admin)
- `GET /api/members/public` - Public member list

### Contributions
- `GET /api/contributions` - Get all contributions
- `POST /api/contributions` - Create contribution
- `PUT /api/contributions/:id` - Update contribution
- `DELETE /api/contributions/:id` - Delete contribution

### Loans
- `GET /api/loans` - Get all loans
- `POST /api/loans` - Apply for loan
- `PUT /api/loans/:id/approve` - Approve loan
- `PUT /api/loans/:id/disburse` - Disburse loan
- `POST /api/loans/:id/repayment` - Add repayment

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/export/:type` - Export data (CSV)
- `GET /api/admin/settings` - Get admin settings
- `PUT /api/admin/settings` - Update settings

### Contact
- `POST /api/contact` - Submit contact form

## 🔐 Default Admin Credentials

After first setup, create an admin account:
- **Email**: admin@booseere.com (or your configured email)
- **Password**: Set during registration

## 📁 Project Structure

```
cooperative/
├── backend/
│   ├── controllers/     # Business logic
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Email, file upload services
│   ├── middleware/     # Auth, error handling
│   ├── config/         # Database configuration
│   └── server.js       # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── context/    # React context providers
│   │   ├── api/        # API service functions
│   │   └── App.jsx     # Main app component
│   └── vercel.json     # Vercel deployment config
└── README.md
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check your `MONGODB_URI` in .env
   - Ensure MongoDB is running (local) or Atlas is accessible

2. **Email Not Sending**
   - Verify Gmail app password
   - Check EMAIL_USER and EMAIL_PASSWORD in .env

3. **Build Errors**
   - Run `npm install` in both directories
   - Check Node.js version (18+ required)

4. **CORS Errors**
   - Update `FRONTEND_URL` in backend .env
   - Restart backend server

## 📞 Support

For support or questions:
- Email: support@booseere.coop
- Create an issue in the repository

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

**Built with ❤️ for cooperative societies**