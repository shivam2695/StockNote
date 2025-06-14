import { useState, useEffect } from 'react';
import { FocusStock } from '../types/FocusStock';
import { apiService } from '../services/api';

export function useFocusStocks(userEmail?: string) {
  const [focusStocks, setFocusStocks] = useState<FocusStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load focus stocks from API
  const loadFocusStocks = async () => {
    if (!userEmail) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getFocusStocks();
      
      if (response.success && response.data.stocks) {
        // Transform API data to match frontend FocusStock interface
        const transformedStocks = response.data.stocks.map((stock: any) => ({
          id: stock._id,
          symbol: stock.stockName,
          targetPrice: stock.targetPrice,
          currentPrice: stock.currentPrice,
          reason: stock.reason || '',
          dateAdded: stock.createdAt ? stock.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
          tradeTaken: stock.tradeTaken || false,
          tradeDate: stock.tradeDate ? stock.tradeDate.split('T')[0] : undefined,
          notes: stock.notes
        }));
        
        setFocusStocks(transformedStocks);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load focus stocks');
      console.error('Load focus stocks error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFocusStocks();
  }, [userEmail]);

  const addFocusStock = async (stockData: Omit<FocusStock, 'id'>) => {
    try {
      // Transform frontend FocusStock to API format
      const apiData = {
        stockName: stockData.symbol.toUpperCase().trim(),
        entryPrice: stockData.currentPrice, // Use current price as entry price
        targetPrice: stockData.targetPrice,
        stopLossPrice: stockData.currentPrice * 0.95, // Default 5% stop loss
        currentPrice: stockData.currentPrice,
        reason: stockData.reason,
        notes: stockData.notes,
        tradeTaken: stockData.tradeTaken,
        tradeDate: stockData.tradeDate
      };
      
      const response = await apiService.createFocusStock(apiData);
      
      if (response.success) {
        await loadFocusStocks(); // Reload from server
      }
    } catch (error) {
      console.error('Add focus stock error:', error);
      throw error;
    }
  };

  const updateFocusStock = async (stockId: string, stockData: Omit<FocusStock, 'id'>) => {
    try {
      // Transform frontend FocusStock to API format
      const apiData = {
        stockName: stockData.symbol.toUpperCase().trim(),
        entryPrice: stockData.currentPrice,
        targetPrice: stockData.targetPrice,
        stopLossPrice: stockData.currentPrice * 0.95,
        currentPrice: stockData.currentPrice,
        reason: stockData.reason,
        notes: stockData.notes,
        tradeTaken: stockData.tradeTaken,
        tradeDate: stockData.tradeDate
      };
      
      const response = await apiService.updateFocusStock(stockId, apiData);
      
      if (response.success) {
        await loadFocusStocks(); // Reload from server
      }
    } catch (error) {
      console.error('Update focus stock error:', error);
      throw error;
    }
  };

  const deleteFocusStock = async (stockId: string) => {
    try {
      const response = await apiService.deleteFocusStock(stockId);
      
      if (response.success) {
        await loadFocusStocks(); // Reload from server
      }
    } catch (error) {
      console.error('Delete focus stock error:', error);
      throw error;
    }
  };

  const markTradeTaken = async (stockId: string, tradeTaken: boolean, tradeDate?: string) => {
    try {
      const response = await apiService.markFocusStockTaken(stockId, tradeTaken, tradeDate);
      
      if (response.success) {
        await loadFocusStocks(); // Reload from server
      }
    } catch (error) {
      console.error('Mark trade taken error:', error);
      throw error;
    }
  };

  return {
    focusStocks,
    loading,
    error,
    addFocusStock,
    updateFocusStock,
    deleteFocusStock,
    markTradeTaken,
    refetch: loadFocusStocks
  };
}