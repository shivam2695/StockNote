import { apiService } from './api';

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

  async getQuote(symbol: string): Promise<Quote | null> {
    try {
      // Check cache first
      const cached = this.cache.get(symbol.toUpperCase());
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }

      const response = await apiService.makeRequest(`/market/quote/${symbol.toUpperCase()}`);
      
      if (response.success && response.data) {
        // Cache the result
        this.cache.set(symbol.toUpperCase(), {
          data: response.data,
          timestamp: Date.now()
        });
        
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to fetch quote for ${symbol}:`, error);
      return null;
    }
  }

  async getMultipleQuotes(symbols: string[]): Promise<Quote[]> {
    try {
      const uncachedSymbols: string[] = [];
      const results: Quote[] = [];

      // Check cache for each symbol
      symbols.forEach(symbol => {
        const cached = this.cache.get(symbol.toUpperCase());
        if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
          results.push(cached.data);
        } else {
          uncachedSymbols.push(symbol);
        }
      });

      // Fetch uncached symbols
      if (uncachedSymbols.length > 0) {
        const response = await apiService.makeRequest('/market/quotes', {
          method: 'POST',
          body: JSON.stringify({ symbols: uncachedSymbols })
        });

        if (response.success && response.data) {
          response.data.forEach((quote: Quote) => {
            if (quote && quote.currentPrice !== null && quote.currentPrice !== undefined) {
              // Cache successful results
              this.cache.set(quote.symbol, {
                data: quote,
                timestamp: Date.now()
              });
              results.push(quote);
            }
          });
        }
      }

      return results;
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

      const response = await apiService.makeRequest(`/market/search/${encodeURIComponent(query)}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return [];
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