import { useState, useEffect } from 'react';
import { Trade, TradeStats } from '../types/Trade';

export function useTrades(userEmail?: string) {
  const [trades, setTrades] = useState<Trade[]>([]);

  // Create user-specific storage key
  const getStorageKey = () => {
    if (!userEmail) return 'stockRecordsTrades';
    return `stockRecordsTrades_${userEmail}`;
  };

  // Load trades from localStorage on component mount
  useEffect(() => {
    if (!userEmail) return;
    
    const storageKey = getStorageKey();
    const savedTrades = localStorage.getItem(storageKey);
    
    if (savedTrades) {
      setTrades(JSON.parse(savedTrades));
    } else {
      // Initialize with empty array for new users
      setTrades([]);
    }
  }, [userEmail]);

  // Save trades to localStorage whenever trades change
  useEffect(() => {
    if (!userEmail) return;
    
    const storageKey = getStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(trades));
  }, [trades, userEmail]);

  const addTrade = (tradeData: Omit<Trade, 'id'>) => {
    const newTrade: Trade = {
      ...tradeData,
      id: Date.now().toString()
    };
    setTrades(prev => [...prev, newTrade]);
  };

  const updateTrade = (tradeId: string, tradeData: Omit<Trade, 'id'>) => {
    setTrades(prev => 
      prev.map(trade => 
        trade.id === tradeId ? { ...tradeData, id: tradeId } : trade
      )
    );
  };

  const deleteTrade = (tradeId: string) => {
    setTrades(prev => prev.filter(trade => trade.id !== tradeId));
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
    addTrade,
    updateTrade,
    deleteTrade,
    calculateStats,
    getTradesByMonth
  };
}