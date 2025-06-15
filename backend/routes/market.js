const express = require('express');
const finnhubService = require('../services/finnhubService');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/market/quote/:symbol
// @desc    Get current market price for a symbol
// @access  Private
router.get('/quote/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol || symbol.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Symbol is required'
      });
    }

    const quote = await finnhubService.getQuote(symbol.trim());
    
    res.json({
      success: true,
      data: quote
    });
  } catch (error) {
    console.error('Get quote error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch quote'
    });
  }
});

// @route   POST /api/market/quotes
// @desc    Get current market prices for multiple symbols
// @access  Private
router.post('/quotes', auth, async (req, res) => {
  try {
    const { symbols } = req.body;
    
    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Symbols array is required'
      });
    }

    if (symbols.length > 20) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 20 symbols allowed per request'
      });
    }

    const quotes = await finnhubService.getMultipleQuotes(symbols);
    
    res.json({
      success: true,
      data: quotes
    });
  } catch (error) {
    console.error('Get multiple quotes error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch quotes'
    });
  }
});

// @route   GET /api/market/search/:query
// @desc    Search for stock symbols
// @access  Private
router.get('/search/:query', auth, async (req, res) => {
  try {
    const { query } = req.params;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const results = await finnhubService.searchSymbols(query.trim());
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Search symbols error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to search symbols'
    });
  }
});

module.exports = router;