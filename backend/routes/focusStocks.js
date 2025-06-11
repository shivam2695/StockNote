const express = require('express');
const FocusStock = require('../models/FocusStock');
const auth = require('../middleware/auth');
const { validateFocusStock } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/focus-stocks
// @desc    Get all focus stocks for authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50, tradeTaken, symbol, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build filter
    const filter = { user: req.user._id };
    if (tradeTaken !== undefined) filter.tradeTaken = tradeTaken === 'true';
    if (symbol) filter.symbol = symbol.toUpperCase();
    
    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const focusStocks = await FocusStock.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await FocusStock.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        focusStocks,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get focus stocks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching focus stocks'
    });
  }
});

// @route   GET /api/focus-stocks/stats
// @desc    Get focus stock statistics for authenticated user
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await FocusStock.getUserFocusStats(req.user._id);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get focus stock stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching focus stock statistics'
    });
  }
});

// @route   GET /api/focus-stocks/pending
// @desc    Get pending focus stocks (not taken as trades)
// @access  Private
router.get('/pending', auth, async (req, res) => {
  try {
    const focusStocks = await FocusStock.find({
      user: req.user._id,
      tradeTaken: false
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: { focusStocks }
    });
  } catch (error) {
    console.error('Get pending focus stocks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending focus stocks'
    });
  }
});

// @route   GET /api/focus-stocks/taken
// @desc    Get taken focus stocks (converted to trades)
// @access  Private
router.get('/taken', auth, async (req, res) => {
  try {
    const focusStocks = await FocusStock.find({
      user: req.user._id,
      tradeTaken: true
    }).sort({ tradeDate: -1 });
    
    res.json({
      success: true,
      data: { focusStocks }
    });
  } catch (error) {
    console.error('Get taken focus stocks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching taken focus stocks'
    });
  }
});

// @route   GET /api/focus-stocks/:id
// @desc    Get single focus stock
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const focusStock = await FocusStock.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!focusStock) {
      return res.status(404).json({
        success: false,
        message: 'Focus stock not found'
      });
    }
    
    res.json({
      success: true,
      data: { focusStock }
    });
  } catch (error) {
    console.error('Get focus stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching focus stock'
    });
  }
});

// @route   POST /api/focus-stocks
// @desc    Create new focus stock
// @access  Private
router.post('/', auth, validateFocusStock, async (req, res) => {
  try {
    const focusStockData = {
      ...req.body,
      user: req.user._id,
      symbol: req.body.symbol.toUpperCase()
    };
    
    const focusStock = new FocusStock(focusStockData);
    await focusStock.save();
    
    res.status(201).json({
      success: true,
      message: 'Focus stock created successfully',
      data: { focusStock }
    });
  } catch (error) {
    console.error('Create focus stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating focus stock'
    });
  }
});

// @route   PUT /api/focus-stocks/:id
// @desc    Update focus stock
// @access  Private
router.put('/:id', auth, validateFocusStock, async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      symbol: req.body.symbol.toUpperCase()
    };
    
    const focusStock = await FocusStock.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!focusStock) {
      return res.status(404).json({
        success: false,
        message: 'Focus stock not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Focus stock updated successfully',
      data: { focusStock }
    });
  } catch (error) {
    console.error('Update focus stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating focus stock'
    });
  }
});

// @route   PATCH /api/focus-stocks/:id/mark-taken
// @desc    Mark focus stock as trade taken
// @access  Private
router.patch('/:id/mark-taken', auth, async (req, res) => {
  try {
    const { tradeTaken, tradeDate } = req.body;
    
    const focusStock = await FocusStock.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { 
        tradeTaken: tradeTaken !== undefined ? tradeTaken : true,
        tradeDate: tradeTaken ? (tradeDate || new Date()) : undefined
      },
      { new: true, runValidators: true }
    );
    
    if (!focusStock) {
      return res.status(404).json({
        success: false,
        message: 'Focus stock not found'
      });
    }
    
    res.json({
      success: true,
      message: `Focus stock marked as ${tradeTaken ? 'taken' : 'pending'}`,
      data: { focusStock }
    });
  } catch (error) {
    console.error('Mark focus stock taken error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating focus stock status'
    });
  }
});

// @route   DELETE /api/focus-stocks/:id
// @desc    Delete focus stock
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const focusStock = await FocusStock.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!focusStock) {
      return res.status(404).json({
        success: false,
        message: 'Focus stock not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Focus stock deleted successfully'
    });
  } catch (error) {
    console.error('Delete focus stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting focus stock'
    });
  }
});

module.exports = router;