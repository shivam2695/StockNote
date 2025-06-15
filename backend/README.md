# StockNote Backend API v2.0

A comprehensive REST API for the StockNote Trading Journal application built with Node.js, Express.js, and MongoDB. This backend supports individual trading journals, team trading, focus stocks management, and book recommendations with real-time market data integration.

## 🚀 Features

### Core Collections

#### 1. **Users**
- User authentication and profile management
- Email verification system with OTP
- Password reset functionality
- User activity tracking

#### 2. **Journal Entries**
- Individual trade tracking
- Automatic P&L calculations
- Monthly performance analytics
- Team trade integration
- Status management (open/closed)

#### 3. **Focus Stocks**
- Watchlist management
- Target price tracking
- Risk-reward ratio calculations
- Trade conversion monitoring
- Status indicators (green/red/neutral)

#### 4. **Books**
- Trading book recommendations
- User ratings and reviews
- Search and filtering capabilities
- Popular books tracking

#### 5. **Teams**
- Team creation and management
- Member role management (admin/member/viewer)
- Team statistics and analytics
- Privacy settings

#### 6. **Team Trades**
- Collaborative trading decisions
- Voting system for trades
- Team performance tracking
- Strategy documentation

#### 7. **Market Data (NEW)**
- Real-time stock quotes via Yahoo Finance
- Stock symbol search and autocomplete
- Support for US and Indian markets
- Current Market Price (CMP) integration

### 🔐 Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation and sanitization
- CORS configuration
- Security headers with Helmet
- Email verification enforcement

### 📊 Analytics & Reporting
- User trading statistics
- Team performance metrics
- Monthly performance tracking
- P&L calculations
- Win rate analysis
- Risk-reward ratios

### 📈 Market Data Integration
- **Yahoo Finance Integration**: Real-time market data without API keys
- **Multi-Market Support**: US stocks (NASDAQ, NYSE) and Indian stocks (NSE, BSE)
- **Smart Symbol Formatting**: Automatic .NS suffix for Indian stocks
- **Search & Autocomplete**: Intelligent stock symbol search
- **Caching**: 1-minute cache for optimal performance
- **Error Handling**: Graceful fallbacks for unavailable data

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Gmail account with App Password for email service

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

### Required Email Configuration for Gmail:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this 16-character password (not your regular Gmail password)

3. **Update .env file**:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/stocknote

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# Email Configuration (REQUIRED for email verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password

# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Market Data - Yahoo Finance (No API key required)
# Yahoo Finance integration is automatic and requires no additional configuration
```

5. **Start the server**
```bash
# Development
npm run dev

# Production
npm start
```

## 📧 Email Configuration

### Gmail SMTP Setup

1. **Enable 2-Factor Authentication**
   - Go to your Google Account
   - Navigate to Security
   - Enable 2-Step Verification

2. **Generate App Password**
   - In Security settings, go to "2-Step Verification"
   - Scroll down to "App passwords"
   - Select "Mail" and generate password
   - Copy the 16-character password

3. **Environment Variables**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=abcd-efgh-ijkl-mnop  # 16-character app password
```

### Testing Email Configuration

The server will automatically test email configuration on startup:

```bash
✅ Email service is ready
```

If you see an error:
```bash
⚠️  Email service configuration needs attention
```

Check your environment variables and Gmail app password.

## 📈 Market Data Integration

### Yahoo Finance Service

The backend now includes comprehensive market data integration using Yahoo Finance:

#### Features:
- **Real-time Quotes**: Current price, change, volume, and more
- **Multi-Market Support**: 
  - US Stocks: AAPL, MSFT, GOOGL, etc.
  - Indian Stocks: RELIANCE.NS, TCS.NS, INFY.NS, etc.
- **Smart Symbol Detection**: Automatically adds .NS suffix for Indian stocks
- **Search & Autocomplete**: Find stocks by name or symbol
- **Caching**: 1-minute cache for optimal performance
- **Error Handling**: Graceful fallbacks when data is unavailable

#### Supported Markets:
- **US Markets**: NASDAQ, NYSE
- **Indian Markets**: NSE (National Stock Exchange), BSE (Bombay Stock Exchange)

#### API Endpoints:

```bash
# Get single quote
GET /api/market/quote/AAPL
GET /api/market/quote/RELIANCE  # Automatically becomes RELIANCE.NS

# Get multiple quotes
POST /api/market/quotes
Body: { "symbols": ["AAPL", "MSFT", "RELIANCE"] }

# Search symbols
GET /api/market/search/apple
GET /api/market/search/reliance

# Health check
GET /api/market/health
```

#### Example Response:
```json
{
  "success": true,
  "data": {
    "symbol": "AAPL",
    "currentPrice": 150.25,
    "change": 2.15,
    "changePercent": 1.45,
    "high": 152.00,
    "low": 148.50,
    "open": 149.00,
    "previousClose": 148.10,
    "currency": "USD",
    "name": "Apple Inc.",
    "timestamp": 1640995200000
  }
}
```

## 📚 API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: https://stocknote-backend.onrender.com/api
```

### Authentication Flow

#### 1. Register User
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email for verification.",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "verified": false
    },
    "requiresEmailVerification": true
  }
}
```

#### 2. Verify Email
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "email": "john@example.com",
  "token": "123456"
}
```

#### 3. Login (Only for verified users)
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Market Data Endpoints

#### Get Stock Quote
```http
GET /api/market/quote/AAPL
Authorization: Bearer <token>
```

#### Search Stocks
```http
GET /api/market/search/apple
Authorization: Bearer <token>
```

#### Get Multiple Quotes
```http
POST /api/market/quotes
Authorization: Bearer <token>
Content-Type: application/json

{
  "symbols": ["AAPL", "MSFT", "RELIANCE"]
}
```

### Journal Entries Endpoints

#### Get All Journal Entries
```http
GET /api/journal-entries
Authorization: Bearer <token>
Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 50)
- status: Filter by status (open/closed)
- stockName: Filter by stock name
- month: Filter by month
- year: Filter by year
```

#### Create Journal Entry
```http
POST /api/journal-entries
Authorization: Bearer <token>
Content-Type: application/json

{
  "stockName": "AAPL",
  "entryPrice": 150.00,
  "entryDate": "2024-01-15",
  "currentPrice": 155.00,
  "status": "open",
  "remarks": "Strong technical setup",
  "quantity": 10,
  "isTeamTrade": false
}
```

### Focus Stocks Endpoints

#### Get All Focus Stocks
```http
GET /api/focus-stocks
Authorization: Bearer <token>
```

#### Create Focus Stock
```http
POST /api/focus-stocks
Authorization: Bearer <token>
Content-Type: application/json

{
  "stockName": "TSLA",
  "entryPrice": 200.00,
  "targetPrice": 250.00,
  "stopLossPrice": 180.00,
  "currentPrice": 205.00,
  "reason": "Earnings play",
  "notes": "Strong fundamentals"
}
```

## 🗃️ Database Schema

### User Model
```javascript
{
  email: String (unique, required),
  name: String (required),
  password: String (hashed, required),
  verified: Boolean (default: false),
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  isActive: Boolean (default: true),
  timestamps: true
}
```

## 🔧 Configuration

### MongoDB Setup
1. **Local MongoDB**: Install MongoDB locally
2. **MongoDB Atlas**: Use cloud MongoDB service
3. **Connection String**: Update `MONGODB_URI` in `.env`

### Email Configuration
1. **Gmail**: Use App Passwords for Gmail SMTP
2. **Other Providers**: Configure SMTP settings accordingly

### JWT Configuration
1. **Secret**: Generate a strong JWT secret
2. **Expiration**: Configure token expiration time

### Market Data Configuration
- **Yahoo Finance**: No API key required
- **Automatic Setup**: Service initializes automatically
- **Multi-Market**: Supports US and Indian markets
- **Caching**: Built-in 1-minute cache for performance

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
FRONTEND_URL=https://stocknote.netlify.app
```

## 📊 API Response Format

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

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🔒 Security Features

- **Helmet**: Security headers
- **Rate Limiting**: Prevent abuse
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Express-validator
- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Email Verification**: Mandatory email verification
- **MongoDB Injection Protection**: Mongoose sanitization

## 📈 Performance Features

- **Database Indexing**: Optimized queries
- **Pagination**: Efficient data loading
- **Aggregation Pipelines**: Complex analytics
- **Connection Pooling**: MongoDB connection optimization
- **Market Data Caching**: 1-minute cache for quotes
- **Email Configuration Testing**: Startup validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions:
- Create an issue on GitHub
- Contact the development team

## 🔄 Version History

- **v2.0.0**: Complete backend with market data integration
  - Yahoo Finance integration for real-time market data
  - Multi-market support (US and Indian stocks)
  - Smart symbol formatting and search
  - Enhanced CMP (Current Market Price) features
  - Mandatory email verification before login
  - Fixed nodemailer configuration
  - Enhanced security and validation
  - Comprehensive analytics
  - Team trading with voting system
  - Gmail SMTP integration