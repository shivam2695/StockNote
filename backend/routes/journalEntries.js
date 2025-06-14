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
    .isFloat({ min: 0 })
    .withMessage('Entry price must be a positive number'),
  body('entryDate')
    .isISO8601()
    .withMessage('Entry date must be a valid date'),
  body('currentPrice')
    .isFloat({ min: 0 })
    .withMessage('Current price must be a positive number'),
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
    .isFloat({ min: 0 })
    .withMessage('Exit price must be a positive number'),
  body('exitDate')
    .optional()
    .isISO8601()
    .withMessage('Exit date must be a valid date'),
  body('isTeamTrade')
    .optional()
    .isBoolean()
    .withMessage('isTeamTrade must be a boolean')
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
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Validate closed trade requirements
    if (req.body.status === 'closed') {
      if (!req.body.exitPrice) {
        return res.status(400).json({
          success: false,
          message: 'Exit price is required for closed trades'
        });
      }
      if (!req.body.exitDate) {
        return res.status(400).json({
          success: false,
          message: 'Exit date is required for closed trades'
        });
      }
    }

    const entryData = {
      ...req.body,
      user: req.user._id,
      stockName: req.body.stockName.toUpperCase(),
      quantity: req.body.quantity || 1,
      isTeamTrade: req.body.isTeamTrade || false
    };
    
    const entry = new JournalEntry(entryData);
    await entry.save();
    
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
        errors: errors.array()
      });
    }

    // Validate closed trade requirements
    if (req.body.status === 'closed') {
      if (!req.body.exitPrice) {
        return res.status(400).json({
          success: false,
          message: 'Exit price is required for closed trades'
        });
      }
      if (!req.body.exitDate) {
        return res.status(400).json({
          success: false,
          message: 'Exit date is required for closed trades'
        });
      }
    }

    const updateData = {
      ...req.body,
      stockName: req.body.stockName.toUpperCase(),
      quantity: req.body.quantity || 1,
      isTeamTrade: req.body.isTeamTrade || false
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