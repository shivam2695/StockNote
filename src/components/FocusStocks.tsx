import React, { useState } from 'react';
import { FocusStock } from '../types/FocusStock';
import FocusStocksTable from './FocusStocksTable';
import FocusStockModal from './FocusStockModal';
import { FocusStockTag } from './FocusStockTags';
import { Target, PlusCircle, TrendingUp, Eye, AlertCircle } from 'lucide-react';

interface FocusStocksProps {
  stocks: FocusStock[];
  onAddStock: (stock: Omit<FocusStock, 'id'>) => void;
  onEditStock: (stockId: string, stock: Omit<FocusStock, 'id'>) => void;
  onDeleteStock: (stockId: string) => void;
  onMarkTradeTaken: (stockId: string, tradeTaken: boolean, tradeDate?: string) => void;
  onUpdateStockTag?: (stockId: string, tag: FocusStockTag) => void;
}

export default function FocusStocks({ 
  stocks, 
  onAddStock, 
  onEditStock, 
  onDeleteStock, 
  onMarkTradeTaken,
  onUpdateStockTag
}: FocusStocksProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<FocusStock | undefined>();
  const [error, setError] = useState<string>('');

  const handleEditStock = (stock: FocusStock) => {
    setEditingStock(stock);
    setIsModalOpen(true);
  };

  const handleSaveStock = async (stockData: Omit<FocusStock, 'id'>) => {
    try {
      setError('');
      if (editingStock) {
        await onEditStock(editingStock.id, stockData);
      } else {
        await onAddStock(stockData);
      }
      setEditingStock(undefined);
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Save focus stock error:', error);
      setError(error.message || 'Failed to save focus stock');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStock(undefined);
    setError('');
  };

  const pendingStocks = stocks.filter(stock => !stock.tradeTaken);
  const takenStocks = stocks.filter(stock => stock.tradeTaken);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateAveragePotentialReturn = (stockList: FocusStock[]) => {
    if (stockList.length === 0) return 0;
    const totalReturn = stockList.reduce((sum, stock) => {
      return sum + ((stock.targetPrice - stock.currentPrice) / stock.currentPrice) * 100;
    }, 0);
    return totalReturn / stockList.length;
  };

  // Calculate tag statistics
  const getTagStats = () => {
    const tagCounts = {
      worked: stocks.filter(s => s.tag === 'worked').length,
      missed: stocks.filter(s => s.tag === 'missed').length,
      failed: stocks.filter(s => s.tag === 'failed').length,
      watch: stocks.filter(s => s.tag === 'watch').length
    };
    return tagCounts;
  };

  const tagStats = getTagStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Focus Stocks</h1>
          <p className="text-gray-600 mt-1">Track potential trading opportunities and monitor your watchlist</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Add Stock</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-red-800 text-sm font-medium">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium opacity-90">Total Focus Stocks</h3>
            <Eye className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold mb-2">{stocks.length}</div>
          <p className="text-sm opacity-80">{pendingStocks.length} pending, {takenStocks.length} taken</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium opacity-90">Pending Opportunities</h3>
            <Target className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold mb-2">{pendingStocks.length}</div>
          <p className="text-sm opacity-80">
            Avg. potential: {calculateAveragePotentialReturn(pendingStocks).toFixed(1)}%
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium opacity-90">Trades Taken</h3>
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold mb-2">{takenStocks.length}</div>
          <p className="text-sm opacity-80">
            {stocks.length > 0 ? ((takenStocks.length / stocks.length) * 100).toFixed(0) : 0}% conversion rate
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium opacity-90">Performance Tags</h3>
            <Target className="w-6 h-6" />
          </div>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>✅ Worked:</span>
              <span className="font-semibold">{tagStats.worked}</span>
            </div>
            <div className="flex justify-between">
              <span>🟡 Missed:</span>
              <span className="font-semibold">{tagStats.missed}</span>
            </div>
            <div className="flex justify-between">
              <span>🔴 Failed:</span>
              <span className="font-semibold">{tagStats.failed}</span>
            </div>
            <div className="flex justify-between">
              <span>🔵 Watch:</span>
              <span className="font-semibold">{tagStats.watch}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Stocks */}
      {pendingStocks.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Target className="w-6 h-6 text-orange-500" />
            <span>Pending Opportunities</span>
          </h2>
          <FocusStocksTable
            stocks={pendingStocks}
            onEditStock={handleEditStock}
            onDeleteStock={onDeleteStock}
            onMarkTradeTaken={onMarkTradeTaken}
            onUpdateStockTag={onUpdateStockTag}
          />
        </div>
      )}

      {/* Taken Trades */}
      {takenStocks.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-green-500" />
            <span>Trades Taken</span>
          </h2>
          <FocusStocksTable
            stocks={takenStocks}
            onEditStock={handleEditStock}
            onDeleteStock={onDeleteStock}
            onMarkTradeTaken={onMarkTradeTaken}
            onUpdateStockTag={onUpdateStockTag}
          />
        </div>
      )}

      {/* All Stocks */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">All Focus Stocks</h2>
        {stocks.length > 0 ? (
          <FocusStocksTable
            stocks={stocks}
            onEditStock={handleEditStock}
            onDeleteStock={onDeleteStock}
            onMarkTradeTaken={onMarkTradeTaken}
            onUpdateStockTag={onUpdateStockTag}
          />
        ) : (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No focus stocks yet</h3>
            <p className="text-gray-600 mb-4">Start building your watchlist by adding stocks you're interested in trading</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Stock
            </button>
          </div>
        )}
      </div>

      {/* Focus Stock Modal */}
      <FocusStockModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveStock}
        stock={editingStock}
      />
    </div>
  );
}