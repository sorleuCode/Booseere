# Cooperative Management Platform - Backend API

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and update with your credentials:

```bash
cp .env.example .env
```

**Required Configuration:**
- `MONGODB_URI`: Your MongoDB connection string
  - Local: `mongodb://localhost:27017/cooperative_db`
  - Atlas: `mongodb+srv://<username>:<password>@cluster.mongodb.net/cooperative_db`
- `JWT_SECRET`: Change to a secure random string
- `CLOUDINARY_*`: Add your Cloudinary credentials for image uploads (optional)

### 3. Start MongoDB
If using local MongoDB:
```bash
mongod
```

Or use MongoDB Atlas (cloud) - create free account at https://www.mongodb.com/cloud/atlas

### 4. Run the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server runs on `http://localhost:5000`

### 5. Create First Admin User

Use API endpoint or MongoDB directly:

**Via API (after server is running):**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@cooperative.com",
    "password": "admin123",
    "fullName": "Admin User",
    "phone": "1234567890"
  }'
```

Then manually update the user role to 'admin' in MongoDB.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Members
- `GET /api/members` - Get all members (with filters)
- `GET /api/members/:id` - Get single member
- `PUT /api/members/:id` - Update member (Admin only)
- `GET /api/members/stats` - Get member statistics

### Contributions
- `GET /api/contributions` - Get all contributions
- `POST /api/contributions` - Create contribution (Admin only)
- `GET /api/contributions/:id` - Get single contribution
- `PUT /api/contributions/:id` - Update contribution (Admin only)
- `DELETE /api/contributions/:id` - Delete contribution (Admin only)
- `GET /api/contributions/member/:memberId` - Get member contributions

### Loans
- `GET /api/loans` - Get all loans
- `POST /api/loans` - Apply for loan
- `GET /api/loans/:id` - Get single loan
- `PUT /api/loans/:id/approve` - Approve loan (Admin only)
- `PUT /api/loans/:id/reject` - Reject loan (Admin only)
- `PUT /api/loans/:id/disburse` - Disburse loan (Admin only)
- `POST /api/loans/:id/repayment` - Add repayment (Admin only)
- `GET /api/loans/member/:memberId` - Get member loans

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics (Admin only)
- `GET /api/admin/activities` - Get recent activities (Admin only)
- `GET /api/admin/financial-report` - Get financial report (Admin only)
- `POST /api/admin/create-admin` - Create admin user (Admin only)

## Authentication

All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Database Models

### User
- username, email, password (hashed)
- role: 'admin' | 'member'
- isActive: boolean

### Member
- userId (ref to User)
- fullName, phone, address
- position: 'President' | 'Vice President' | 'Secretary' | 'Treasurer' | 'Member'
- membershipNumber (unique)
- status: 'active' | 'inactive' | 'suspended'
- totalContributions, totalLoans, outstandingLoan

### Contribution
- memberId (ref to Member)
- amount, contributionType, paymentMethod
- paymentDate, receiptNumber
- status: 'verified' | 'pending' | 'rejected'
- recordedBy (ref to User)

### Loan
- memberId (ref to Member)
- loanAmount, interestRate, totalAmount
- status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'repaying' | 'completed' | 'defaulted'
- repayments: [{ amount, paymentDate, receiptNumber }]
- guarantors: [{ memberId, name, phone }]

## Testing

Health check endpoint:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## Deployment

### Backend Deployment Options:
1. **Render** (Recommended) - https://render.com
2. **Railway** - https://railway.app
3. **Heroku** - https://heroku.com
4. **DigitalOcean App Platform**

### Database:
- **MongoDB Atlas** (Free tier available) - https://www.mongodb.com/cloud/atlas

## Security Features

- Password hashing with bcrypt
- JWT authentication
- Helmet.js for security headers
- CORS configuration
- Rate limiting (can be added)
- Input validation with express-validator

## Next Steps

1. Set up MongoDB (local or Atlas)
2. Configure environment variables
3. Install dependencies and start server
4. Create admin user
5. Test API endpoints
6. Connect frontend application
