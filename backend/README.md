# StockNote Backend API v2.0

A comprehensive REST API for the StockNote Trading Journal application built with Node.js, Express.js, and MongoDB. This backend supports individual trading journals, team trading, focus stocks management, and book recommendations.

## 🚀 Features

### Core Collections

#### 1. **Users**
- User authentication and profile management
- Email verification system
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

### 🔐 Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation and sanitization
- CORS configuration
- Security headers with Helmet

### 📊 Analytics & Reporting
- User trading statistics
- Team performance metrics
- Monthly performance tracking
- P&L calculations
- Win rate analysis
- Risk-reward ratios

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

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
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

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
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

#### Get Journal Statistics
```http
GET /api/journal-entries/stats
Authorization: Bearer <token>
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

### Team Endpoints

#### Get User Teams
```http
GET /api/teams
Authorization: Bearer <token>
```

#### Create Team
```http
POST /api/teams
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Alpha Traders",
  "description": "Professional trading team",
  "settings": {
    "isPrivate": false,
    "allowMemberInvites": true,
    "requireApproval": false
  }
}
```

#### Add Team Member
```http
POST /api/teams/:id/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "userEmail": "member@example.com",
  "role": "member"
}
```

### Team Trades Endpoints

#### Get Team Trades
```http
GET /api/team-trades/team/:teamId
Authorization: Bearer <token>
```

#### Create Team Trade
```http
POST /api/team-trades
Authorization: Bearer <token>
Content-Type: application/json

{
  "team": "team_id_here",
  "stockName": "GOOGL",
  "entryPrice": 2800.00,
  "entryDate": "2024-01-15",
  "remarks": "AI momentum play",
  "strategy": "Momentum",
  "riskLevel": "medium",
  "targetPrice": 3000.00,
  "stopLoss": 2700.00
}
```

#### Vote on Team Trade
```http
POST /api/team-trades/:id/vote
Authorization: Bearer <token>
Content-Type: application/json

{
  "vote": "buy",
  "comment": "Strong technical indicators"
}
```

### Books Endpoints

#### Get All Books
```http
GET /api/books
Query Parameters:
- page: Page number
- limit: Items per page
- genre: Filter by genre
- minRating: Minimum rating filter
- search: Search query
```

#### Rate a Book
```http
POST /api/books/:id/rate
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 4.5,
  "review": "Excellent trading strategies"
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
  lastLogin: Date,
  isActive: Boolean (default: true),
  timestamps: true
}
```

### Journal Entry Model
```javascript
{
  user: ObjectId (ref: User, required),
  stockName: String (required, uppercase),
  entryPrice: Number (required, min: 0),
  entryDate: Date (required),
  currentPrice: Number (required, min: 0),
  pnl: Number (calculated),
  pnlPercentage: Number (calculated),
  status: String (enum: ['open', 'closed']),
  remarks: String (max: 500),
  isTeamTrade: Boolean (default: false),
  month: String (auto-generated),
  year: Number (auto-generated),
  quantity: Number (default: 1),
  exitPrice: Number,
  exitDate: Date,
  timestamps: true
}
```

### Focus Stock Model
```javascript
{
  user: ObjectId (ref: User, required),
  stockName: String (required, uppercase),
  entryPrice: Number (required, min: 0),
  targetPrice: Number (required, min: 0),
  stopLossPrice: Number (required, min: 0),
  currentPrice: Number (required, min: 0),
  status: String (enum: ['green', 'red', 'neutral']),
  month: String (auto-generated),
  year: Number (auto-generated),
  reason: String (max: 200),
  tradeTaken: Boolean (default: false),
  tradeDate: Date,
  notes: String (max: 500),
  potentialReturn: Number (calculated),
  potentialReturnPercentage: Number (calculated),
  riskRewardRatio: Number (calculated),
  timestamps: true
}
```

### Team Model
```javascript
{
  name: String (required, unique),
  description: String (max: 500),
  members: [{
    user: ObjectId (ref: User),
    role: String (enum: ['admin', 'member', 'viewer']),
    joinedAt: Date,
    isActive: Boolean
  }],
  createdBy: ObjectId (ref: User, required),
  isActive: Boolean (default: true),
  settings: {
    isPrivate: Boolean,
    allowMemberInvites: Boolean,
    requireApproval: Boolean
  },
  stats: {
    totalTrades: Number,
    totalPnL: Number,
    winRate: Number
  },
  timestamps: true
}
```

### Team Trade Model
```javascript
{
  team: ObjectId (ref: Team, required),
  stockName: String (required, uppercase),
  entryPrice: Number (required, min: 0),
  entryDate: Date (required),
  remarks: String (max: 500),
  currentPrice: Number,
  quantity: Number (default: 1),
  status: String (enum: ['open', 'closed']),
  exitPrice: Number,
  exitDate: Date,
  pnl: Number (calculated),
  pnlPercentage: Number (calculated),
  createdBy: ObjectId (ref: User, required),
  strategy: String (max: 100),
  riskLevel: String (enum: ['low', 'medium', 'high']),
  targetPrice: Number,
  stopLoss: Number,
  votes: [{
    user: ObjectId (ref: User),
    vote: String (enum: ['buy', 'sell', 'hold']),
    votedAt: Date,
    comment: String (max: 200)
  }],
  month: String (auto-generated),
  year: Number (auto-generated),
  timestamps: true
}
```

### Book Model
```javascript
{
  title: String (required, max: 200),
  summary: String (required, max: 2000),
  coverImage: String (required),
  author: String (max: 100),
  isbn: String (unique, sparse),
  publishedDate: Date,
  genre: String (max: 50),
  rating: Number (min: 0, max: 5),
  totalRatings: Number (default: 0),
  isActive: Boolean (default: true),
  tags: [String],
  readBy: [{
    user: ObjectId (ref: User),
    dateRead: Date,
    userRating: Number (min: 0, max: 5),
    userReview: String (max: 1000)
  }],
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
2. **SendGrid**: Configure SendGrid API
3. **Other Providers**: Configure SMTP settings

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
- **MongoDB Injection Protection**: Mongoose sanitization

## 📈 Performance Features

- **Database Indexing**: Optimized queries
- **Pagination**: Efficient data loading
- **Aggregation Pipelines**: Complex analytics
- **Caching**: Redis integration ready
- **Compression**: Response compression
- **Connection Pooling**: MongoDB connection optimization

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

- **v2.0.0**: Complete backend with all collections
  - Journal Entries management
  - Focus Stocks tracking
  - Team collaboration features
  - Book recommendations
  - Enhanced security and validation
  - Comprehensive analytics
  - Team trading with voting system