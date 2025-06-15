import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';

interface Quote {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  currency?: string;
  timestamp: number;
}

interface CMPDisplayProps {
  symbol: string;
  className?: string;
  showChange?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export default function CMPDisplay({
  symbol,
  className = "",
  showChange = false,
  autoRefresh = true,
  refreshInterval = 60000 // 1 minute
}: CMPDisplayProps) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Mock price data for demonstration
  const getMockQuote = (symbol: string): Quote => {
    const basePrice = Math.random() * 200 + 50; // Random price between 50-250
    const change = (Math.random() - 0.5) * 10; // Random change between -5 to +5
    const changePercent = (change / basePrice) * 100;
    
    return {
      symbol: symbol.toUpperCase(),
      currentPrice: basePrice,
      change: change,
      changePercent: changePercent,
      currency: symbol.includes('.NS') ? 'INR' : 'USD',
      timestamp: Date.now()
    };
  };

  const fetchQuote = async () => {
    if (!symbol || symbol.trim().length === 0) return;

    setLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate mock data
      const data = getMockQuote(symbol);
      setQuote(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to fetch');
      setQuote(null);
      console.error(`CMP fetch error for ${symbol}:`, err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchQuote();

    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchQuote, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [symbol, autoRefresh, refreshInterval]);

  const formatPrice = (price: number, currency?: string): string => {
    const isINR = currency === 'INR' || symbol.includes('.NS');
    
    return new Intl.NumberFormat(isINR ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: isINR ? 'INR' : 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-3 h-3" />;
    if (change < 0) return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  if (loading && !quote) {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />
        <span className="text-sm text-blue-500">Loading...</span>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className={`text-sm text-gray-400 ${className}`}>
        –
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center space-x-1">
        <span className="text-sm font-medium text-blue-600">
          {formatPrice(quote.currentPrice, quote.currency)}
        </span>
        {loading && (
          <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />
        )}
      </div>
      
      {showChange && (
        <div className={`flex items-center space-x-1 text-xs ${getChangeColor(quote.change)}`}>
          {getChangeIcon(quote.change)}
          <span>
            {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)} ({quote.changePercent >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%)
          </span>
        </div>
      )}
      
      {lastUpdated && (
        <div className="text-xs text-gray-400">
          {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}