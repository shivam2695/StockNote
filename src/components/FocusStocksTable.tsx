import React, { useState } from 'react';
import { FocusStock } from '../types/FocusStock';
import { Target, TrendingUp, CheckCircle, Circle, Edit, Trash2, Calendar } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';
import FocusStockTags, { FocusStockTag } from './FocusStockTags';
import CMPDisplay from './CMPDisplay';

interface FocusStocksTableProps {
  stocks: FocusStock[];
  onEditStock: (stock: FocusStock) => void;
  onDeleteStock: (stockId: string) => void;
  onMarkTradeTaken: (stockId: string, tradeTaken: boolean, tradeDate?: string) => void;
  onUpdateStockTag?: (stockId: string, tag: FocusStockTag) => void;
}

export default function FocusStocksTable({ 
  stocks, 
  onEditStock, 
  onDeleteStock, 
  onMarkTradeTaken,
  onUpdateStockTag
}: FocusStocksTableProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; stock?: FocusStock }>({ isOpen: false });
  const [isDeleting, setIsDeleting] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculatePotentialReturn = (currentPrice: number, targetPrice: number) => {
    return ((targetPrice - currentPrice) / currentPrice) * 100;
  };

  const getReturnColor = (returnPercentage: number) => {
    if (returnPercentage > 0) return 'text-green-600';
    if (returnPercentage < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getStockLogo = (symbol: string) => {
    return symbol.charAt(0).toUpperCase();
  };

  const handleTradeTakenToggle = (stock: FocusStock) => {
    if (!stock.tradeTaken) {
      const tradeDate = new Date().toISOString().split('T')[0];
      onMarkTradeTaken(stock.id, true, tradeDate);
    } else {
      onMarkTradeTaken(stock.id, false);
    }
  };

  const handleDeleteClick = (stock: FocusStock) => {
    setDeleteConfirm({ isOpen: true, stock });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.stock) return;
    
    setIsDeleting(true);
    try {
      await onDeleteStock(deleteConfirm.stock.id);
      setDeleteConfirm({ isOpen: false });
    } catch (error) {
      console.error('Delete focus stock error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTagChange = (stockId: string, tag: FocusStockTag) => {
    if (onUpdateStockTag) {
      onUpdateStockTag(stockId, tag);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Symbol</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Current Price</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">CMP</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Target Price</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Potential Return</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Reason</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Tags</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Date Added</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stocks.map((stock) => {
                const potentialReturn = calculatePotentialReturn(stock.currentPrice, stock.targetPrice);
                return (
                  <tr key={stock.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleTradeTakenToggle(stock)}
                          className="flex items-center space-x-2 hover:bg-gray-100 p-1 rounded transition-colors"
                        >
                          {stock.tradeTaken ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400" />
                          )}
                          <span className={`text-sm font-medium ${
                            stock.tradeTaken ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            {stock.tradeTaken ? 'Taken' : 'Pending'}
                          </span>
                        </button>
                      </div>
                      {stock.tradeTaken && stock.tradeDate && (
                        <div className="flex items-center space-x-1 mt-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {formatDate(stock.tradeDate)}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{getStockLogo(stock.symbol)}</span>
                        </div>
                        <span className="font-semibold text-gray-900">{stock.symbol}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-900">{formatCurrency(stock.currentPrice)}</td>
                    <td className="py-4 px-6">
                      <CMPDisplay symbol={stock.symbol} />
                    </td>
                    <td className="py-4 px-6 text-gray-900">{formatCurrency(stock.targetPrice)}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1">
                        <TrendingUp className={`w-4 h-4 ${getReturnColor(potentialReturn)}`} />
                        <span className={`font-semibold ${getReturnColor(potentialReturn)}`}>
                          {potentialReturn.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-700 text-sm">{stock.reason}</span>
                      {stock.notes && (
                        <div className="text-xs text-gray-500 mt-1">{stock.notes}</div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <FocusStockTags
                        selectedTag={stock.tag}
                        onTagChange={(tag) => handleTagChange(stock.id, tag)}
                      />
                    </td>
                    <td className="py-4 px-6 text-gray-600">{formatDate(stock.dateAdded)}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onEditStock(stock)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit Focus Stock"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(stock)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete Focus Stock"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false })}
        onConfirm={handleDeleteConfirm}
        title="Delete Focus Stock"
        message={`Are you sure you want to delete ${deleteConfirm.stock?.symbol} from your focus stocks? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </>
  );
}