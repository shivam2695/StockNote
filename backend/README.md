# StockNote Backend API

A comprehensive REST API for the StockNote Trading Journal application built with Node.js, Express.js, and MongoDB.

## 🚀 Features

### Authentication & Security
- ✅ JWT-based authentication
- ✅ Email verification with OTP
- ✅ Password reset functionality
- ✅ Rate limiting and security headers
- ✅ Input validation and sanitization
- ✅ CORS configuration

### Trading Management
- ✅ CRUD operations for trades
- ✅ Trade statistics and analytics
- ✅ Monthly trade filtering
- ✅ Portfolio performance tracking

### Focus Stocks
- ✅ Watchlist management
- ✅ Target price tracking
- ✅ Trade conversion monitoring
- ✅ Performance analytics

### User Management
- ✅ Profile management
- ✅ Password change
- ✅ Account deletion
- ✅ Dashboard data aggregation

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Email service (Gmail, SendGrid, etc.)

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd stocknote-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
cp .env.example .env
```

4. **Configure environment variables**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/stocknote

# JWT Secret (generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Environment
NODE_ENV=development
PORT=5000
```

5. **Start the server**
```bash
# Development
npm run dev

# Production
npm start
```

## 📚 API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: https://stocknote-backend.onrender.com/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Verify Email
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "email": "john@example.com",
  "token": "123456"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "john@example.com",
  "token": "123456",
  "newPassword": "newpassword123"
}
```

### Trade Endpoints

#### Get All Trades
```http
GET /api/trades
Authorization: Bearer <token>
```

#### Get Trade Statistics
```http
GET /api/trades/stats
Authorization: Bearer <token>
```

#### Create Trade
```http
POST /api/trades
Authorization: Bearer <token>
Content-Type: application/json

{
  "symbol": "AAPL",
  "type": "BUY",
  "entryPrice": 150.00,
  "quantity": 10,
  "entryDate": "2024-01-15",
  "status": "ACTIVE",
  "notes": "Strong technical setup"
}
```

#### Update Trade
```http
PUT /api/trades/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "symbol": "AAPL",
  "type": "BUY",
  "entryPrice": 150.00,
  "exitPrice": 160.00,
  "quantity": 10,
  "entryDate": "2024-01-15",
  "exitDate": "2024-01-20",
  "status": "CLOSED",
  "notes": "Profit target reached"
}
```

#### Delete Trade
```http
DELETE /api/trades/:id
Authorization: Bearer <token>
```

### Focus Stock Endpoints

#### Get All Focus Stocks
```http
GET /api/focus-stocks
Authorization: Bearer <token>
```

#### Get Focus Stock Statistics
```http
GET /api/focus-stocks/stats
Authorization: Bearer <token>
```

#### Create Focus Stock
```http
POST /api/focus-stocks
Authorization: Bearer <token>
Content-Type: application/json

{
  "symbol": "TSLA",
  "targetPrice": 250.00,
  "currentPrice": 200.00,
  "reason": "Earnings play",
  "dateAdded": "2024-01-15",
  "notes": "Strong fundamentals"
}
```

#### Mark Trade Taken
```http
PATCH /api/focus-stocks/:id/mark-taken
Authorization: Bearer <token>
Content-Type: application/json

{
  "tradeTaken": true,
  "tradeDate": "2024-01-20"
}
```

### User Endpoints

#### Get Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

#### Change Password
```http
PUT /api/users/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

#### Get Dashboard Data
```http
GET /api/users/dashboard
Authorization: Bearer <token>
```

## 🔧 Configuration

### MongoDB Setup
1. **Local MongoDB**: Install MongoDB locally or use MongoDB Atlas
2. **Connection String**: Update `MONGODB_URI` in `.env`

### Email Configuration
1. **Gmail**: Use App Passwords for Gmail SMTP
2. **Other Providers**: Configure SMTP settings accordingly

### JWT Configuration
1. **Secret**: Generate a strong JWT secret
2. **Expiration**: Configure token expiration time

## 🚀 Deployment

### Render Deployment
1. **Connect Repository**: Link your GitHub repository
2. **Environment Variables**: Set all required environment variables
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stocknote
JWT_SECRET=your-production-jwt-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-production-email@gmail.com
EMAIL_PASS=your-production-app-password
PORT=5000
```

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  isEmailVerified: Boolean,
  lastLogin: Date,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Trade Model
```javascript
{
  user: ObjectId (ref: User),
  symbol: String,
  type: String (BUY/SELL),
  entryPrice: Number,
  exitPrice: Number,
  quantity: Number,
  entryDate: Date,
  exitDate: Date,
  status: String (ACTIVE/CLOSED),
  notes: String,
  totalInvestment: Number,
  totalReturn: Number,
  returnPercentage: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### FocusStock Model
```javascript
{
  user: ObjectId (ref: User),
  symbol: String,
  targetPrice: Number,
  currentPrice: Number,
  reason: String,
  dateAdded: Date,
  tradeTaken: Boolean,
  tradeDate: Date,
  notes: String,
  potentialReturn: Number,
  potentialReturnPercentage: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Features

- **Helmet**: Security headers
- **Rate Limiting**: Prevent abuse
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Express-validator
- **Password Hashing**: bcryptjs
- **JWT Authentication**: Secure token-based auth

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    // Validation errors (if any)
  ]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions:
- Create an issue on GitHub
- Contact the development team

## 🔄 Version History

- **v1.0.0**: Initial release with core features
- Authentication system
- Trading journal management
- Focus stocks tracking
- User management
- Email notifications