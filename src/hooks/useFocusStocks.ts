import { useState, useEffect } from 'react';
import { FocusStock } from '../types/FocusStock';

export function useFocusStocks() {
  const [focusStocks, setFocusStocks] = useState<FocusStock[]>([]);

  // Load focus stocks from localStorage on component mount
  useEffect(() => {
    const savedFocusStocks = localStorage.getItem('stockRecordsFocusStocks');
    if (savedFocusStocks) {
      setFocusStocks(JSON.parse(savedFocusStocks));
    } else {
      // Add some sample data for demonstration
      const sampleFocusStocks: FocusStock[] = [
        {
          id: '1',
          symbol: 'INFY',
          targetPrice: 1850.00,
          currentPrice: 1780.00,
          reason: 'Strong technical breakout expected',
          dateAdded: '2024-12-01',
          tradeTaken: false,
          notes: 'Wait for volume confirmation'
        },
        {
          id: '2',
          symbol: 'WIPRO',
          targetPrice: 650.00,
          currentPrice: 620.00,
          reason: 'Oversold on RSI, good support level',
          dateAdded: '2024-11-28',
          tradeTaken: true,
          tradeDate: '2024-12-02',
          notes: 'Entered at ₹625'
        },
        {
          id: '3',
          symbol: 'ICICIBANK',
          targetPrice: 1250.00,
          currentPrice: 1180.00,
          reason: 'Banking sector recovery play',
          dateAdded: '2024-11-25',
          tradeTaken: false,
          notes: 'Monitor quarterly results'
        }
      ];
      setFocusStocks(sampleFocusStocks);
      localStorage.setItem('stockRecordsFocusStocks', JSON.stringify(sampleFocusStocks));
    }
  }, []);

  // Save focus stocks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('stockRecordsFocusStocks', JSON.stringify(focusStocks));
  }, [focusStocks]);

  const addFocusStock = (stockData: Omit<FocusStock, 'id'>) => {
    const newStock: FocusStock = {
      ...stockData,
      id: Date.now().toString()
    };
    setFocusStocks(prev => [...prev, newStock]);
  };

  const updateFocusStock = (stockId: string, stockData: Omit<FocusStock, 'id'>) => {
    setFocusStocks(prev => 
      prev.map(stock => 
        stock.id === stockId ? { ...stockData, id: stockId } : stock
      )
    );
  };

  const deleteFocusStock = (stockId: string) => {
    setFocusStocks(prev => prev.filter(stock => stock.id !== stockId));
  };

  const markTradeTaken = (stockId: string, tradeTaken: boolean, tradeDate?: string) => {
    setFocusStocks(prev => 
      prev.map(stock => 
        stock.id === stockId 
          ? { ...stock, tradeTaken, tradeDate: tradeTaken ? tradeDate : undefined }
          : stock
      )
    );
  };

  return {
    focusStocks,
    addFocusStock,
    updateFocusStock,
    deleteFocusStock,
    markTradeTaken
  };
}