import { useState, useEffect } from 'react';
import { FocusStock } from '../types/FocusStock';

export function useFocusStocks(userEmail?: string) {
  const [focusStocks, setFocusStocks] = useState<FocusStock[]>([]);

  // Create user-specific storage key
  const getStorageKey = () => {
    if (!userEmail) return 'stockRecordsFocusStocks';
    return `stockRecordsFocusStocks_${userEmail}`;
  };

  // Load focus stocks from localStorage on component mount
  useEffect(() => {
    if (!userEmail) return;
    
    const storageKey = getStorageKey();
    const savedFocusStocks = localStorage.getItem(storageKey);
    
    if (savedFocusStocks) {
      setFocusStocks(JSON.parse(savedFocusStocks));
    } else {
      // Initialize with empty array for new users
      setFocusStocks([]);
    }
  }, [userEmail]);

  // Save focus stocks to localStorage whenever they change
  useEffect(() => {
    if (!userEmail) return;
    
    const storageKey = getStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(focusStocks));
  }, [focusStocks, userEmail]);

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