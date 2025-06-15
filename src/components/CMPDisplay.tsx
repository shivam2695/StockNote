import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import { marketService, Quote } from '../services/marketService';

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

  const fetchQuote = async () => {
    if (!symbol || symbol.trim().length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const data = await marketService.getQuote(symbol.trim());
      if (data) {
        setQuote(data);
        setLastUpdated(new Date());
      } else {
        setError('No data available');
      }
    } catch (err) {
      setError('Failed to fetch');
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
        <RefreshCw className="w-3 h-3 text-gray-400 animate-spin" />
        <span className="text-sm text-gray-500">Loading...</span>
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
        <span className="text-sm font-medium text-gray-700">
          {formatPrice(quote.currentPrice)}
        </span>
        {loading && (
          <RefreshCw className="w-3 h-3 text-gray-400 animate-spin" />
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