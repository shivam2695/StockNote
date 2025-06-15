const yahooFinance = require('yahoo-finance2').default;

class YahooFinanceService {
  constructor() {
    console.log('✅ Yahoo Finance service initialized');
  }

  // Convert symbol to Yahoo Finance format (add .NS for Indian stocks if needed)
  formatSymbol(symbol) {
    const cleanSymbol = symbol.toUpperCase().trim();
    
    // List of common Indian stock symbols that need .NS suffix
    const indianStocks = [
      'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'HINDUNILVR', 'ITC', 'SBIN', 
      'BHARTIARTL', 'KOTAKBANK', 'LT', 'ASIANPAINT', 'AXISBANK', 'MARUTI', 'TITAN',
      'NESTLEIND', 'ULTRACEMCO', 'BAJFINANCE', 'HCLTECH', 'WIPRO', 'SUNPHARMA',
      'NTPC', 'POWERGRID', 'ONGC', 'TATAMOTORS', 'TATASTEEL', 'JSWSTEEL', 'HINDALCO',
      'ADANIENT', 'ADANIPORTS', 'COALINDIA', 'DRREDDY', 'EICHERMOT', 'GRASIM',
      'HEROMOTOCO', 'INDUSINDBK', 'BAJAJFINSV', 'TECHM', 'CIPLA', 'DIVISLAB'
    ];
    
    // If it's a known Indian stock and doesn't already have .NS, add it
    if (indianStocks.includes(cleanSymbol) && !cleanSymbol.includes('.NS')) {
      return `${cleanSymbol}.NS`;
    }
    
    // If it already has .NS or other exchange suffix, return as is
    if (cleanSymbol.includes('.')) {
      return cleanSymbol;
    }
    
    // For US stocks, return as is
    return cleanSymbol;
  }

  async getQuote(symbol) {
    try {
      const formattedSymbol = this.formatSymbol(symbol);
      console.log(`📊 Fetching quote for ${symbol} (formatted: ${formattedSymbol})`);
      
      const quote = await yahooFinance.quote(formattedSymbol, {
        fields: ['regularMarketPrice', 'regularMarketChange', 'regularMarketChangePercent', 
                'regularMarketDayHigh', 'regularMarketDayLow', 'regularMarketOpen', 
                'regularMarketPreviousClose', 'currency', 'shortName', 'longName']
      });

      if (!quote || quote.regularMarketPrice === null || quote.regularMarketPrice === undefined) {
        throw new Error('No price data available');
      }

      return {
        symbol: symbol.toUpperCase(),
        originalSymbol: formattedSymbol,
        currentPrice: quote.regularMarketPrice,
        change: quote.regularMarketChange || 0,
        changePercent: quote.regularMarketChangePercent || 0,
        high: quote.regularMarketDayHigh || quote.regularMarketPrice,
        low: quote.regularMarketDayLow || quote.regularMarketPrice,
        open: quote.regularMarketOpen || quote.regularMarketPrice,
        previousClose: quote.regularMarketPreviousClose || quote.regularMarketPrice,
        currency: quote.currency || 'USD',
        name: quote.shortName || quote.longName || symbol,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error(`❌ Yahoo Finance API error for symbol ${symbol}:`, error.message);
      
      // Return null instead of throwing to allow graceful handling
      return null;
    }
  }

  async searchSymbols(query) {
    try {
      console.log(`🔍 Searching symbols for query: ${query}`);
      
      const searchResults = await yahooFinance.search(query, {
        quotesCount: 10,
        newsCount: 0
      });

      if (!searchResults.quotes || !Array.isArray(searchResults.quotes)) {
        return [];
      }

      // Filter and format results
      return searchResults.quotes
        .filter(item => 
          item.symbol && 
          item.shortname && 
          (item.quoteType === 'EQUITY' || item.typeDisp === 'Equity')
        )
        .slice(0, 10)
        .map(item => ({
          symbol: item.symbol,
          description: item.shortname || item.longname || item.symbol,
          displayName: `${item.shortname || item.longname || item.symbol} (${item.symbol})`,
          type: item.typeDisp || 'Equity',
          exchange: item.exchange || ''
        }));
    } catch (error) {
      console.error(`❌ Yahoo Finance search error for query ${query}:`, error.message);
      return [];
    }
  }

  async getMultipleQuotes(symbols) {
    try {
      console.log(`📊 Fetching multiple quotes for: ${symbols.join(', ')}`);
      
      const promises = symbols.map(async (symbol) => {
        try {
          const quote = await this.getQuote(symbol);
          return quote || {
            symbol: symbol.toUpperCase(),
            error: 'No data available',
            currentPrice: null
          };
        } catch (error) {
          return {
            symbol: symbol.toUpperCase(),
            error: error.message,
            currentPrice: null
          };
        }
      });

      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      console.error('❌ Error fetching multiple quotes:', error);
      throw error;
    }
  }

  // Helper method to check if a symbol is likely Indian
  isIndianStock(symbol) {
    const cleanSymbol = symbol.toUpperCase().trim();
    return cleanSymbol.includes('.NS') || cleanSymbol.includes('.BO');
  }

  // Helper method to format currency based on symbol
  formatPrice(price, symbol) {
    const isIndian = this.isIndianStock(symbol);
    
    return new Intl.NumberFormat(isIndian ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: isIndian ? 'INR' : 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  }
}

module.exports = new YahooFinanceService();