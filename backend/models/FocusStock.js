const mongoose = require('mongoose');

const focusStockSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  symbol: {
    type: String,
    required: [true, 'Stock symbol is required'],
    uppercase: true,
    trim: true,
    maxlength: [10, 'Symbol cannot exceed 10 characters']
  },
  targetPrice: {
    type: Number,
    required: [true, 'Target price is required'],
    min: [0, 'Target price must be positive']
  },
  currentPrice: {
    type: Number,
    required: [true, 'Current price is required'],
    min: [0, 'Current price must be positive']
  },
  reason: {
    type: String,
    required: [true, 'Reason for focus is required'],
    trim: true,
    maxlength: [200, 'Reason cannot exceed 200 characters']
  },
  dateAdded: {
    type: Date,
    required: true,
    default: Date.now
  },
  tradeTaken: {
    type: Boolean,
    default: false
  },
  tradeDate: {
    type: Date,
    validate: {
      validator: function(value) {
        if (this.tradeTaken && !value) return false;
        if (value && this.dateAdded && value < this.dateAdded) return false;
        return true;
      },
      message: 'Trade date must be after date added and is required when trade is taken'
    }
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    trim: true
  },
  // Calculated fields
  potentialReturn: {
    type: Number
  },
  potentialReturnPercentage: {
    type: Number
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
focusStockSchema.index({ user: 1, createdAt: -1 });
focusStockSchema.index({ user: 1, symbol: 1 });
focusStockSchema.index({ user: 1, tradeTaken: 1 });

// Calculate potential returns before saving
focusStockSchema.pre('save', function(next) {
  this.potentialReturn = this.targetPrice - this.currentPrice;
  this.potentialReturnPercentage = ((this.targetPrice - this.currentPrice) / this.currentPrice) * 100;
  next();
});

// Virtual for formatted potential return
focusStockSchema.virtual('formattedPotentialReturn').get(function() {
  return {
    amount: this.potentialReturn,
    percentage: this.potentialReturnPercentage,
    isPositive: this.potentialReturn >= 0
  };
});

// Static method to get user focus stock statistics
focusStockSchema.statics.getUserFocusStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalFocusStocks: { $sum: 1 },
        pendingStocks: {
          $sum: { $cond: [{ $eq: ['$tradeTaken', false] }, 1, 0] }
        },
        takenStocks: {
          $sum: { $cond: [{ $eq: ['$tradeTaken', true] }, 1, 0] }
        },
        averagePotentialReturn: {
          $avg: { $cond: [{ $eq: ['$tradeTaken', false] }, '$potentialReturnPercentage', null] }
        }
      }
    }
  ]);
  
  const result = stats[0] || {
    totalFocusStocks: 0,
    pendingStocks: 0,
    takenStocks: 0,
    averagePotentialReturn: 0
  };
  
  // Calculate conversion rate
  result.conversionRate = result.totalFocusStocks > 0 
    ? (result.takenStocks / result.totalFocusStocks) * 100 
    : 0;
  
  return result;
};

module.exports = mongoose.model('FocusStock', focusStockSchema);