export interface Quote {
  symbol: string;
  originalSymbol?: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  currency?: string;
  name?: string;
  timestamp: number;
}

export interface SearchResult {
  symbol: string;
  description: string;
  displayName: string;
  type: string;
  exchange?: string;
}

class MarketService {
  private cache = new Map<string, { data: Quote; timestamp: number }>();
  private readonly CACHE_DURATION = 60000; // 1 minute cache

  // Mock data for demonstration
  private generateMockQuote(symbol: string): Quote {
    const basePrice = Math.random() * 200 + 50;
    const change = (Math.random() - 0.5) * 10;
    const changePercent = (change / basePrice) * 100;
    
    return {
      symbol: symbol.toUpperCase(),
      currentPrice: basePrice,
      change: change,
      changePercent: changePercent,
      high: basePrice + Math.random() * 5,
      low: basePrice - Math.random() * 5,
      open: basePrice + (Math.random() - 0.5) * 3,
      previousClose: basePrice - change,
      currency: symbol.includes('.NS') ? 'INR' : 'USD',
      name: `${symbol} Company`,
      timestamp: Date.now()
    };
  }

  async getQuote(symbol: string): Promise<Quote | null> {
    try {
      // Check cache first
      const cached = this.cache.get(symbol.toUpperCase());
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Generate mock data
      const quote = this.generateMockQuote(symbol);
      
      // Cache the result
      this.cache.set(symbol.toUpperCase(), {
        data: quote,
        timestamp: Date.now()
      });
      
      return quote;
    } catch (error) {
      console.error(`Failed to fetch quote for ${symbol}:`, error);
      return null;
    }
  }

  async getMultipleQuotes(symbols: string[]): Promise<Quote[]> {
    try {
      const promises = symbols.map(symbol => this.getQuote(symbol));
      const results = await Promise.all(promises);
      return results.filter(quote => quote !== null) as Quote[];
    } catch (error) {
      console.error('Failed to fetch multiple quotes:', error);
      return [];
    }
  }

  async searchSymbols(query: string): Promise<SearchResult[]> {
    try {
      if (query.length < 2) {
        return [];
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Mock search results
      const allStocks = [
        ...this.getPopularUSStocks().map(symbol => ({
          symbol,
          description: `${symbol} - US Stock`,
          displayName: `${symbol} (US)`,
          type: 'US Equity',
          exchange: 'NASDAQ/NYSE'
        })),
        ...this.getPopularIndianStocks().map(symbol => ({
          symbol,
          description: `${symbol.replace('.NS', '')} - Indian Stock`,
          displayName: `${symbol.replace('.NS', '')} (NSE)`,
          type: 'Indian Equity',
          exchange: 'NSE'
        }))
      ];
      
      return allStocks.filter(stock => 
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.description.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10);
    } catch (error) {
      console.error(`Failed to search symbols for ${query}:`, error);
      return [];
    }
  }

  // Check if symbol is likely Indian stock
  isIndianStock(symbol: string): boolean {
    const cleanSymbol = symbol.toUpperCase().trim();
    return cleanSymbol.includes('.NS') || cleanSymbol.includes('.BO');
  }

  clearCache() {
    this.cache.clear();
  }

  formatPrice(price: number, symbol?: string): string {
    const isIndian = symbol ? this.isIndianStock(symbol) : false;
    
    return new Intl.NumberFormat(isIndian ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: isIndian ? 'INR' : 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  }

  formatChange(change: number, changePercent: number): string {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
  }

  // Get suggested Indian stock symbols for autocomplete
  getPopularIndianStocks(): string[] {
    return [
      'RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS', 'ICICIBANK.NS',
      'HINDUNILVR.NS', 'ITC.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'KOTAKBANK.NS',
      'LT.NS', 'ASIANPAINT.NS', 'AXISBANK.NS', 'MARUTI.NS', 'TITAN.NS',
      'NESTLEIND.NS', 'ULTRACEMCO.NS', 'BAJFINANCE.NS', 'HCLTECH.NS', 'WIPRO.NS'
    ];
  }

  // Get suggested US stock symbols for autocomplete
  getPopularUSStocks(): string[] {
    return [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX',
      'ADBE', 'CRM', 'ORCL', 'INTC', 'AMD', 'PYPL', 'UBER', 'ZOOM',
      'SHOP', 'SQ', 'ROKU', 'TWTR'
    ];
  }
}

export const marketService = new MarketService();
export default marketService;