const axios = require('axios');

class FinnhubService {
  constructor() {
    this.apiKey = process.env.FINNHUB_API_KEY;
    this.baseUrl = 'https://finnhub.io/api/v1';
    
    if (!this.apiKey) {
      console.warn('⚠️ FINNHUB_API_KEY not found in environment variables');
    }
  }

  async getQuote(symbol) {
    try {
      if (!this.apiKey) {
        throw new Error('Finnhub API key not configured');
      }

      const response = await axios.get(`${this.baseUrl}/quote`, {
        params: {
          symbol: symbol.toUpperCase(),
          token: this.apiKey
        },
        timeout: 5000 // 5 second timeout
      });

      const data = response.data;
      
      // Check if we got valid data
      if (data.c === 0 && data.h === 0 && data.l === 0 && data.o === 0) {
        throw new Error('Invalid symbol or no data available');
      }

      return {
        symbol: symbol.toUpperCase(),
        currentPrice: data.c, // Current price
        change: data.d, // Change
        changePercent: data.dp, // Change percent
        high: data.h, // High price of the day
        low: data.l, // Low price of the day
        open: data.o, // Open price of the day
        previousClose: data.pc, // Previous close price
        timestamp: Date.now()
      };
    } catch (error) {
      console.error(`Finnhub API error for symbol ${symbol}:`, error.message);
      throw new Error(`Failed to fetch quote for ${symbol}: ${error.message}`);
    }
  }

  async searchSymbols(query) {
    try {
      if (!this.apiKey) {
        throw new Error('Finnhub API key not configured');
      }

      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          q: query,
          token: this.apiKey
        },
        timeout: 5000
      });

      const data = response.data;
      
      if (!data.result || !Array.isArray(data.result)) {
        return [];
      }

      // Filter and format results
      return data.result
        .filter(item => item.type === 'Common Stock' && item.symbol)
        .slice(0, 10) // Limit to 10 results
        .map(item => ({
          symbol: item.symbol,
          description: item.description,
          displayName: `${item.description} (${item.symbol})`,
          type: item.type
        }));
    } catch (error) {
      console.error(`Finnhub search error for query ${query}:`, error.message);
      return [];
    }
  }

  async getMultipleQuotes(symbols) {
    try {
      const promises = symbols.map(symbol => 
        this.getQuote(symbol).catch(error => ({
          symbol: symbol.toUpperCase(),
          error: error.message,
          currentPrice: null
        }))
      );

      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      console.error('Error fetching multiple quotes:', error);
      throw error;
    }
  }
}

module.exports = new FinnhubService();