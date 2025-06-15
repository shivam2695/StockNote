const express = require('express');
const yahooFinanceService = require('../services/yahooFinanceService');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/market/quote/:symbol
// @desc    Get current market price for a symbol using Yahoo Finance
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

    console.log(`📊 API: Getting quote for ${symbol}`);
    const quote = await yahooFinanceService.getQuote(symbol.trim());
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: `No data found for symbol ${symbol}. Please check the symbol and try again.`
      });
    }
    
    res.json({
      success: true,
      data: quote
    });
  } catch (error) {
    console.error('❌ Get quote error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch quote'
    });
  }
});

// @route   POST /api/market/quotes
// @desc    Get current market prices for multiple symbols using Yahoo Finance
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

    console.log(`📊 API: Getting multiple quotes for ${symbols.length} symbols`);
    const quotes = await yahooFinanceService.getMultipleQuotes(symbols);
    
    res.json({
      success: true,
      data: quotes
    });
  } catch (error) {
    console.error('❌ Get multiple quotes error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch quotes'
    });
  }
});

// @route   GET /api/market/search/:query
// @desc    Search for stock symbols using Yahoo Finance
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

    console.log(`🔍 API: Searching for ${query}`);
    const results = await yahooFinanceService.searchSymbols(query.trim());
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('❌ Search symbols error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to search symbols'
    });
  }
});

// @route   GET /api/market/health
// @desc    Check Yahoo Finance service health
// @access  Private
router.get('/health', auth, async (req, res) => {
  try {
    // Test with a known symbol
    const testQuote = await yahooFinanceService.getQuote('AAPL');
    
    res.json({
      success: true,
      message: 'Yahoo Finance service is operational',
      data: {
        service: 'Yahoo Finance',
        status: 'healthy',
        testSymbol: 'AAPL',
        testResult: testQuote ? 'success' : 'failed',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Market service health check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Yahoo Finance service health check failed',
      error: error.message
    });
  }
});

module.exports = router;