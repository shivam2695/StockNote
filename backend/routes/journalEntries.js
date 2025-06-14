const express = require('express');
const JournalEntry = require('../models/JournalEntry');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Validation middleware
const validateJournalEntry = [
  body('stockName')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Stock name must be between 1 and 20 characters'),
  body('entryPrice')
    .isFloat({ min: 0.01 })
    .withMessage('Entry price must be greater than 0'),
  body('entryDate')
    .isISO8601()
    .withMessage('Entry date must be a valid date')
    .custom((value) => {
      const entryDate = new Date(value);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (entryDate > today) {
        throw new Error('Entry date cannot be in the future');
      }
      return true;
    }),
  body('currentPrice')
    .isFloat({ min: 0.01 })
    .withMessage('Current price must be greater than 0'),
  body('status')
    .isIn(['open', 'closed'])
    .withMessage('Status must be either open or closed'),
  body('remarks')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Remarks cannot exceed 500 characters'),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('exitPrice')
    .optional()
    .custom((value, { req }) => {
      if (req.body.status === 'closed') {
        if (!value || parseFloat(value) <= 0) {
          throw new Error('Exit price is required and must be greater than 0 for closed trades');
        }
      }
      return true;
    }),
  body('exitDate')
    .optional()
    .custom((value, { req }) => {
      if (req.body.status === 'closed') {
        if (!value) {
          throw new Error('Exit date is required for closed trades');
        }
        if (req.body.entryDate) {
          const entryDate = new Date(req.body.entryDate);
          const exitDate = new Date(value);
          if (exitDate < entryDate) {
            throw new Error('Exit date must be after entry date');
          }
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          if (exitDate > today) {
            throw new Error('Exit date cannot be in the future');
          }
        }
      }
      return true;
    }),
  body('isTeamTrade')
    .optional()
    .isBoolean()
    .withMessage('isTeamTrade must be a boolean'),
  body('month')
    .optional()
    .isString()
    .withMessage('Month must be a string'),
  body('year')
    .optional()
    .isInt({ min: 1900, max: 2100 })
    .withMessage('Year must be a valid year')
];

// @route   GET /api/journal-entries
// @desc    Get all journal entries for authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, stockName, month, year, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build filter
    const filter = { user: req.user._id };
    if (status) filter.status = status;
    if (stockName) filter.stockName = stockName.toUpperCase();
    if (month) filter.month = month;
    if (year) filter.year = parseInt(year);
    
    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const entries = await JournalEntry.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await JournalEntry.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        entries,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get journal entries error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching journal entries'
    });
  }
});

// @route   GET /api/journal-entries/stats
// @desc    Get journal entry statistics for authenticated user
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await JournalEntry.getUserStats(req.user._id);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get journal stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching journal statistics'
    });
  }
});

// @route   GET /api/journal-entries/monthly/:year
// @desc    Get monthly performance for authenticated user
// @access  Private
router.get('/monthly/:year', auth, async (req, res) => {
  try {
    const { year } = req.params;
    const monthlyData = await JournalEntry.getMonthlyPerformance(req.user._id, parseInt(year));
    
    res.json({
      success: true,
      data: monthlyData
    });
  } catch (error) {
    console.error('Get monthly performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching monthly performance'
    });
  }
});

// @route   GET /api/journal-entries/:id
// @desc    Get single journal entry
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }
    
    res.json({
      success: true,
      data: { entry }
    });
  } catch (error) {
    console.error('Get journal entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching journal entry'
    });
  }
});

// @route   POST /api/journal-entries
// @desc    Create new journal entry
// @access  Private
router.post('/', auth, validateJournalEntry, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(err => err.msg)
      });
    }

    console.log('Creating journal entry with body:', req.body);
    console.log('User:', req.user._id);

    // Auto-generate month and year from entryDate
    const entryDate = new Date(req.body.entryDate);
    const month = entryDate.toLocaleDateString('en-US', { month: 'long' });
    const year = entryDate.getFullYear();

    const entryData = {
      user: req.user._id,
      stockName: req.body.stockName.toUpperCase().trim(),
      entryPrice: req.body.entryPrice,
      entryDate: req.body.entryDate,
      currentPrice: req.body.currentPrice,
      status: req.body.status,
      quantity: req.body.quantity || 1,
      isTeamTrade: req.body.isTeamTrade || false,
      remarks: req.body.remarks || '',
      month: month,
      year: year,
      // Only include exit fields if status is closed
      ...(req.body.status === 'closed' && {
        exitPrice: req.body.exitPrice,
        exitDate: req.body.exitDate
      })
    };
    
    console.log('Final entry data:', entryData);
    
    const entry = new JournalEntry(entryData);
    await entry.save();
    
    console.log('Entry saved successfully:', entry._id);
    
    res.status(201).json({
      success: true,
      message: 'Journal entry created successfully',
      data: { entry }
    });
  } catch (error) {
    console.error('Create journal entry error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating journal entry'
    });
  }
});

// @route   PUT /api/journal-entries/:id
// @desc    Update journal entry
// @access  Private
router.put('/:id', auth, validateJournalEntry, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(err => err.msg)
      });
    }

    // Auto-generate month and year from entryDate
    const entryDate = new Date(req.body.entryDate);
    const month = entryDate.toLocaleDateString('en-US', { month: 'long' });
    const year = entryDate.getFullYear();

    const updateData = {
      stockName: req.body.stockName.toUpperCase().trim(),
      entryPrice: req.body.entryPrice,
      entryDate: req.body.entryDate,
      currentPrice: req.body.currentPrice,
      status: req.body.status,
      quantity: req.body.quantity || 1,
      isTeamTrade: req.body.isTeamTrade || false,
      remarks: req.body.remarks || '',
      month: month,
      year: year,
      // Only include exit fields if status is closed
      ...(req.body.status === 'closed' && {
        exitPrice: req.body.exitPrice,
        exitDate: req.body.exitDate
      })
    };
    
    const entry = await JournalEntry.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Journal entry updated successfully',
      data: { entry }
    });
  } catch (error) {
    console.error('Update journal entry error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating journal entry'
    });
  }
});

// @route   DELETE /api/journal-entries/:id
// @desc    Delete journal entry
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const entry = await JournalEntry.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Journal entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete journal entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting journal entry'
    });
  }
});

module.exports = router;