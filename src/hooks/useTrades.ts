import { useState, useEffect } from 'react';
import { Trade, TradeStats } from '../types/Trade';
import { apiService } from '../services/api';

export function useTrades(userEmail?: string) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load trades from API
  const loadTrades = async () => {
    if (!userEmail) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getJournalEntries();
      
      if (response.success && response.data.entries) {
        // Transform API data to match frontend Trade interface
        const transformedTrades = response.data.entries.map((entry: any) => ({
          id: entry._id,
          symbol: entry.stockName,
          type: 'BUY' as const, // Default to BUY, can be enhanced later
          entryPrice: entry.entryPrice,
          exitPrice: entry.exitPrice,
          quantity: entry.quantity || 1,
          entryDate: entry.entryDate.split('T')[0], // Convert to YYYY-MM-DD format
          exitDate: entry.exitDate ? entry.exitDate.split('T')[0] : undefined,
          status: entry.status === 'open' ? 'ACTIVE' : 'CLOSED' as 'ACTIVE' | 'CLOSED',
          notes: entry.remarks
        }));
        
        setTrades(transformedTrades);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trades');
      console.error('Load trades error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrades();
  }, [userEmail]);

  const addTrade = async (tradeData: Omit<Trade, 'id'>) => {
    try {
      // Create entry date object to extract month and year
      const entryDate = new Date(tradeData.entryDate);
      const month = entryDate.toLocaleDateString('en-US', { month: 'long' });
      const year = entryDate.getFullYear();

      // Validate required fields for closed trades
      if (tradeData.status === 'CLOSED') {
        if (!tradeData.exitPrice || tradeData.exitPrice <= 0) {
          throw new Error('Exit price is required for closed trades');
        }
        if (!tradeData.exitDate) {
          throw new Error('Exit date is required for closed trades');
        }
        // Validate exit date is after entry date
        if (new Date(tradeData.exitDate) < new Date(tradeData.entryDate)) {
          throw new Error('Exit date must be after entry date');
        }
      }

      // Transform frontend Trade to API JournalEntry format
      const entryData = {
        stockName: tradeData.symbol.toUpperCase().trim(),
        entryPrice: tradeData.entryPrice,
        entryDate: tradeData.entryDate,
        currentPrice: tradeData.status === 'CLOSED' && tradeData.exitPrice ? tradeData.exitPrice : tradeData.entryPrice,
        status: tradeData.status === 'ACTIVE' ? 'open' : 'closed',
        remarks: tradeData.notes || '',
        quantity: tradeData.quantity,
        exitPrice: tradeData.status === 'CLOSED' ? tradeData.exitPrice : undefined,
        exitDate: tradeData.status === 'CLOSED' ? tradeData.exitDate : undefined,
        isTeamTrade: false,
        // Add month and year explicitly
        month: month,
        year: year
      };
      
      console.log('Sending trade data to API:', entryData);
      
      const response = await apiService.createJournalEntry(entryData);
      
      if (response.success) {
        await loadTrades(); // Reload trades from server
      }
    } catch (error) {
      console.error('Add trade error:', error);
      throw error;
    }
  };

  const updateTrade = async (tradeId: string, tradeData: Omit<Trade, 'id'>) => {
    try {
      // Create entry date object to extract month and year
      const entryDate = new Date(tradeData.entryDate);
      const month = entryDate.toLocaleDateString('en-US', { month: 'long' });
      const year = entryDate.getFullYear();

      // Validate required fields for closed trades
      if (tradeData.status === 'CLOSED') {
        if (!tradeData.exitPrice || tradeData.exitPrice <= 0) {
          throw new Error('Exit price is required for closed trades');
        }
        if (!tradeData.exitDate) {
          throw new Error('Exit date is required for closed trades');
        }
        // Validate exit date is after entry date
        if (new Date(tradeData.exitDate) < new Date(tradeData.entryDate)) {
          throw new Error('Exit date must be after entry date');
        }
      }

      // Transform frontend Trade to API JournalEntry format
      const entryData = {
        stockName: tradeData.symbol.toUpperCase().trim(),
        entryPrice: tradeData.entryPrice,
        entryDate: tradeData.entryDate,
        currentPrice: tradeData.status === 'CLOSED' && tradeData.exitPrice ? tradeData.exitPrice : tradeData.entryPrice,
        status: tradeData.status === 'ACTIVE' ? 'open' : 'closed',
        remarks: tradeData.notes || '',
        quantity: tradeData.quantity,
        exitPrice: tradeData.status === 'CLOSED' ? tradeData.exitPrice : undefined,
        exitDate: tradeData.status === 'CLOSED' ? tradeData.exitDate : undefined,
        isTeamTrade: false,
        // Add month and year explicitly
        month: month,
        year: year
      };
      
      const response = await apiService.updateJournalEntry(tradeId, entryData);
      
      if (response.success) {
        await loadTrades(); // Reload trades from server
      }
    } catch (error) {
      console.error('Update trade error:', error);
      throw error;
    }
  };

  const deleteTrade = async (tradeId: string) => {
    try {
      const response = await apiService.deleteJournalEntry(tradeId);
      
      if (response.success) {
        await loadTrades(); // Reload trades from server
      }
    } catch (error) {
      console.error('Delete trade error:', error);
      throw error;
    }
  };

  const calculateStats = (): TradeStats => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const totalInvestment = trades.reduce((sum, trade) => {
      return sum + (trade.entryPrice * trade.quantity);
    }, 0);

    const totalReturn = trades
      .filter(trade => trade.status === 'CLOSED' && trade.exitPrice)
      .reduce((sum, trade) => {
        return sum + ((trade.exitPrice! - trade.entryPrice) * trade.quantity);
      }, 0);

    const monthlyReturn = trades
      .filter(trade => {
        if (trade.status !== 'CLOSED' || !trade.exitDate) return false;
        const exitDate = new Date(trade.exitDate);
        return exitDate.getMonth() === currentMonth && exitDate.getFullYear() === currentYear;
      })
      .reduce((sum, trade) => {
        return sum + ((trade.exitPrice! - trade.entryPrice) * trade.quantity);
      }, 0);

    return {
      totalInvestment,
      totalReturn,
      monthlyReturn,
      totalTrades: trades.length,
      activeTrades: trades.filter(t => t.status === 'ACTIVE').length,
      closedTrades: trades.filter(t => t.status === 'CLOSED').length
    };
  };

  const getTradesByMonth = (month: number, year: number) => {
    return trades.filter(trade => {
      const tradeDate = new Date(trade.entryDate);
      return tradeDate.getMonth() === month && tradeDate.getFullYear() === year;
    });
  };

  return {
    trades,
    loading,
    error,
    addTrade,
    updateTrade,
    deleteTrade,
    calculateStats,
    getTradesByMonth,
    refetch: loadTrades
  };
}