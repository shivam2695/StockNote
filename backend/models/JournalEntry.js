const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  stockName: {
    type: String,
    required: [true, 'Stock name is required'],
    uppercase: true,
    trim: true,
    maxlength: [20, 'Stock name cannot exceed 20 characters']
  },
  entryPrice: {
    type: Number,
    required: [true, 'Entry price is required'],
    min: [0, 'Entry price must be positive']
  },
  entryDate: {
    type: Date,
    required: [true, 'Entry date is required'],
    validate: {
      validator: function(value) {
        return value <= new Date();
      },
      message: 'Entry date cannot be in the future'
    }
  },
  currentPrice: {
    type: Number,
    required: [true, 'Current price is required'],
    min: [0, 'Current price must be positive']
  },
  pnl: {
    type: Number,
    default: 0
  },
  pnlPercentage: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['open', 'closed'],
      message: 'Status must be either open or closed'
    },
    default: 'open'
  },
  remarks: {
    type: String,
    maxlength: [500, 'Remarks cannot exceed 500 characters'],
    trim: true,
    default: ''
  },
  isTeamTrade: {
    type: Boolean,
    default: false
  },
  month: {
    type: String,
    required: false // Make optional since we auto-generate it
  },
  year: {
    type: Number,
    required: false // Make optional since we auto-generate it
  },
  quantity: {
    type: Number,
    default: 1,
    min: [1, 'Quantity must be at least 1']
  },
  exitPrice: {
    type: Number,
    min: [0, 'Exit price must be positive'],
    validate: {
      validator: function(value) {
        return this.status === 'open' || (this.status === 'closed' && value != null);
      },
      message: 'Exit price is required for closed trades'
    }
  },
  exitDate: {
    type: Date,
    validate: {
      validator: function(value) {
        if (this.status === 'closed' && !value) return false;
        if (value && this.entryDate && value < this.entryDate) return false;
        return true;
      },
      message: 'Exit date must be after entry date and is required for closed trades'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
journalEntrySchema.index({ user: 1, createdAt: -1 });
journalEntrySchema.index({ user: 1, stockName: 1 });
journalEntrySchema.index({ user: 1, status: 1 });
journalEntrySchema.index({ user: 1, month: 1, year: 1 });
journalEntrySchema.index({ user: 1, isTeamTrade: 1 });

// Calculate P&L and auto-generate fields before saving
journalEntrySchema.pre('save', function(next) {
  // ALWAYS auto-generate month and year from entryDate
  const entryDate = new Date(this.entryDate);
  this.month = entryDate.toLocaleDateString('en-US', { month: 'long' });
  this.year = entryDate.getFullYear();
  
  // Calculate P&L based on status
  if (this.status === 'closed' && this.exitPrice) {
    // For closed trades, use exit price
    this.pnlPercentage = ((this.exitPrice - this.entryPrice) * 100) / this.entryPrice;
    this.pnl = (this.exitPrice - this.entryPrice) * (this.quantity || 1);
    this.currentPrice = this.exitPrice; // Set current price to exit price for closed trades
  } else {
    // For open trades, use current price
    this.pnlPercentage = ((this.currentPrice - this.entryPrice) * 100) / this.entryPrice;
    this.pnl = (this.currentPrice - this.entryPrice) * (this.quantity || 1);
  }
  
  next();
});

// Static method to get user statistics
journalEntrySchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalTrades: { $sum: 1 },
        openTrades: {
          $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] }
        },
        closedTrades: {
          $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] }
        },
        totalPnL: { $sum: '$pnl' },
        avgPnLPercentage: { $avg: '$pnlPercentage' },
        teamTrades: {
          $sum: { $cond: [{ $eq: ['$isTeamTrade', true] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalTrades: 0,
    openTrades: 0,
    closedTrades: 0,
    totalPnL: 0,
    avgPnLPercentage: 0,
    teamTrades: 0
  };
};

// Static method to get monthly performance
journalEntrySchema.statics.getMonthlyPerformance = async function(userId, year) {
  return await this.aggregate([
    { 
      $match: { 
        user: mongoose.Types.ObjectId(userId),
        year: year || new Date().getFullYear()
      } 
    },
    {
      $group: {
        _id: '$month',
        totalPnL: { $sum: '$pnl' },
        totalTrades: { $sum: 1 },
        avgPnLPercentage: { $avg: '$pnlPercentage' }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
};

module.exports = mongoose.model('JournalEntry', journalEntrySchema);