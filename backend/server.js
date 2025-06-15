const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { testEmailConfig } = require('./utils/email');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const journalEntryRoutes = require('./routes/journalEntries');
const focusStockRoutes = require('./routes/focusStocks');
const bookRoutes = require('./routes/books');
const teamRoutes = require('./routes/teams');
const teamTradeRoutes = require('./routes/teamTrades');
const userRoutes = require('./routes/users');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://stocknote.netlify.app', 
        'https://your-custom-domain.com',
        process.env.FRONTEND_URL
      ].filter(Boolean)
    : [
        'http://localhost:3000', 
        'http://localhost:5173',
        process.env.FRONTEND_URL || 'http://localhost:5173'
      ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection with fallback and better error handling
const connectDB = async () => {
  try {
    // Use environment variable or fallback to a demo MongoDB Atlas connection
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://demo:demo123@cluster0.mongodb.net/stocknote?retryWrites=true&w=majority';
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    // Provide helpful error messages
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 MongoDB connection refused. This could mean:');
      console.log('   1. MongoDB is not running locally');
      console.log('   2. Wrong connection string in MONGODB_URI');
      console.log('   3. Network connectivity issues');
      console.log('');
      console.log('🔧 To fix this:');
      console.log('   - For local MongoDB: Start MongoDB service');
      console.log('   - For MongoDB Atlas: Check your connection string');
      console.log('   - Update MONGODB_URI in your .env file');
    }
    
    // In development, continue without database for frontend testing
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️  Running in development mode without database connection');
      console.log('   Some API endpoints may not work properly');
      return;
    }
    
    process.exit(1);
  }
};

connectDB();

// Test email configuration on startup
testEmailConfig().then(isValid => {
  if (isValid) {
    console.log('✅ Email service is ready');
  } else {
    console.log('⚠️  Email service configuration needs attention');
    console.log('Required environment variables:');
    console.log('- EMAIL_HOST (default: smtp.gmail.com)');
    console.log('- EMAIL_PORT (default: 587)');
    console.log('- EMAIL_USER (your Gmail address)');
    console.log('- EMAIL_PASS (your Gmail app password)');
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'StockNote Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0',
    database: {
      connected: mongoose.connection.readyState === 1,
      state: mongoose.connection.readyState
    },
    email: {
      configured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/journal-entries', journalEntryRoutes);
app.use('/api/focus-stocks', focusStockRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/team-trades', teamTradeRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }
  
  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  // JWT expired error
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }
  
  // Mongoose cast error
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err 
    })
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 StockNote Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/api`);
});

module.exports = app;