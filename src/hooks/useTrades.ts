import { useState, useEffect } from 'react';
import { Trade, TradeStats } from '../types/Trade';

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>([]);

  // Load trades from localStorage on component mount
  useEffect(() => {
    const savedTrades = localStorage.getItem('stockRecordsTrades');
    if (savedTrades) {
      setTrades(JSON.parse(savedTrades));
    } else {
      // Add some sample data for demonstration with Indian stock symbols and INR prices
      const sampleTrades: Trade[] = [
        {
          id: '1',
          symbol: 'RELIANCE',
          type: 'BUY',
          entryPrice: 2450.00,
          exitPrice: 2680.00,
          quantity: 100,
          entryDate: '2024-01-15',
          exitDate: '2024-02-20',
          status: 'CLOSED',
          notes: 'Strong quarterly results expected'
        },
        {
          id: '2',
          symbol: 'TCS',
          type: 'BUY',
          entryPrice: 3850.00,
          quantity: 50,
          entryDate: '2024-02-01',
          status: 'ACTIVE',
          notes: 'Long-term IT sector play'
        },
        {
          id: '3',
          symbol: 'HDFC',
          type: 'BUY',
          entryPrice: 1650.00,
          exitPrice: 1580.00,
          quantity: 75,
          entryDate: '2024-01-10',
          exitDate: '2024-01-25',
          status: 'CLOSED',
          notes: 'Stop loss triggered due to banking sector concerns'
        }
      ];
      setTrades(sampleTrades);
      localStorage.setItem('stockRecordsTrades', JSON.stringify(sampleTrades));
    }
  }, []);

  // Save trades to localStorage whenever trades change
  useEffect(() => {
    localStorage.setItem('stockRecordsTrades', JSON.stringify(trades));
  }, [trades]);

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