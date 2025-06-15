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
const marketRoutes = require('./routes/market');

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

// CORS configuration - Updated to include stocknote.in domain
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://stocknote.in',
        'https://www.stocknote.in',
        'https://stocknote.netlify.app', 
        'https://your-custom-domain.com',
        process.env.FRONTEND_URL
      ].filter(Boolean)
    : [
        'http://localhost:3000', 
        'http://localhost:5173',
        'https://stocknote.in',
        'https://www.stocknote.in',
        'https://stocknote.netlify.app',
        process.env.FRONTEND_URL || 'http://localhost:5173'
      ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar']
};

// Log CORS configuration for debugging
console.log('🌐 CORS Configuration:');
console.log('- Environment:', process.env.NODE_ENV || 'development');
console.log('- Allowed Origins:', corsOptions.origin);
console.log('- Allowed Methods:', corsOptions.methods);
console.log('- Credentials Enabled:', corsOptions.credentials);

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

// Database connection with proper standalone configuration
const connectDB = async () => {
  try {
    console.log('🔗 Attempting MongoDB connection...');
    console.log('📍 MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    
    // Determine MongoDB URI
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/stocknote';
    console.log('🔗 Using MongoDB URI pattern:', mongoURI.replace(/\/\/.*@/, '//***:***@'));
    
    // Connection options for standalone MongoDB (no replica set)
    const connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Remove replica set specific options
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000, // 45 seconds
      family: 4, // Use IPv4, skip trying IPv6
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Maintain a minimum of 5 socket connections
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
      // Explicitly disable replica set options
      replicaSet: undefined,
      readPreference: 'primary'
    };

    console.log('⚙️ Connection options:', {
      serverSelectionTimeoutMS: connectionOptions.serverSelectionTimeoutMS,
      socketTimeoutMS: connectionOptions.socketTimeoutMS,
      maxPoolSize: connectionOptions.maxPoolSize,
      replicaSet: connectionOptions.replicaSet
    });

    const conn = await mongoose.connect(mongoURI, connectionOptions);
    
    console.log('✅ MongoDB Connected Successfully!');
    console.log('📊 Connection Details:');
    console.log('- Host:', conn.connection.host);
    console.log('- Port:', conn.connection.port);
    console.log('- Database:', conn.connection.name);
    console.log('- Ready State:', conn.connection.readyState);
    console.log('- Connection ID:', conn.connection.id);
    
    // Log connection state details
    const adminDb = conn.connection.db.admin();
    try {
      const serverStatus = await adminDb.serverStatus();
      console.log('🔍 Server Info:');
      console.log('- Version:', serverStatus.version);
      console.log('- Uptime:', Math.floor(serverStatus.uptime / 60), 'minutes');
      console.log('- Connections:', serverStatus.connections);
    } catch (statusError) {
      console.log('ℹ️ Could not retrieve server status (normal for some MongoDB setups)');
    }

  } catch (error) {
    console.error('❌ MongoDB Connection Error:');
    console.error('- Error Name:', error.name);
    console.error('- Error Message:', error.message);
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.error('🔧 Connection Issue: Cannot reach MongoDB server');
      console.error('   - Check if MongoDB is running');
      console.error('   - Verify the connection string');
      console.error('   - Check network connectivity');
    } else if (error.message.includes('Authentication failed')) {
      console.error('🔐 Authentication Issue: Invalid credentials');
      console.error('   - Check username and password in connection string');
      console.error('   - Verify database user permissions');
    } else if (error.message.includes('replica set')) {
      console.error('🔄 Replica Set Issue: Using standalone connection');
      console.error('   - Remove replicaSet parameter from connection string');
      console.error('   - Use standalone MongoDB URI format');
    }
    
    console.error('💡 Suggested MongoDB URI formats:');
    console.error('   - Local: mongodb://localhost:27017/stocknote');
    console.error('   - Atlas: mongodb+srv://username:password@cluster.mongodb.net/stocknote');
    console.error('   - Remote: mongodb://username:password@host:port/stocknote');
    
    process.exit(1);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 Mongoose disconnected from MongoDB');
});

// Connect to database
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

// Test Yahoo Finance service
console.log('📊 Yahoo Finance service loaded');

// Health check endpoint with enhanced CORS debugging
app.get('/health', (req, res) => {
  const origin = req.get('Origin');
  console.log('🏥 Health check request from origin:', origin);
  
  res.status(200).json({
    status: 'OK',
    message: 'StockNote Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0',
    cors: {
      requestOrigin: origin,
      allowedOrigins: corsOptions.origin,
      corsEnabled: true
    },
    database: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      readyState: mongoose.connection.readyState
    },
    email: {
      configured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587
    },
    marketData: {
      service: 'Yahoo Finance',
      status: 'available'
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
app.use('/api/market', marketRoutes);

// 404 handler
app.use('*', (req, res) => {
  const origin = req.get('Origin');
  console.log('🔍 404 request from origin:', origin, 'for path:', req.originalUrl);
  
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method,
    origin: origin
  });
});

// Global error handler
app.use((err, req, res, next) => {
  const origin = req.get('Origin');
  console.error('💥 Error from origin:', origin, 'Error:', err);
  
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
  console.log(`🌐 CORS enabled for origins:`, corsOptions.origin);
});

module.exports = app;