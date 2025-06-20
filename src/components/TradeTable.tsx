import React, { useState } from 'react';
import { Trade } from '../types/Trade';
import { TrendingUp, TrendingDown, Circle, CheckCircle2, Edit, Trash2, Target } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';
import MarkAsClosedModal from './MarkAsClosedModal';

interface TradeTableProps {
  trades: Trade[];
  onEditTrade: (trade: Trade) => void;
  onDeleteTrade: (tradeId: string) => void;
  onUpdateTrade?: (tradeId: string, tradeData: Omit<Trade, 'id'>) => Promise<void>;
}

export default function TradeTable({ trades, onEditTrade, onDeleteTrade, onUpdateTrade }: TradeTableProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; trade?: Trade }>({ isOpen: false });
  const [markAsClosed, setMarkAsClosed] = useState<{ isOpen: boolean; trade?: Trade }>({ isOpen: false });
  const [isDeleting, setIsDeleting] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateReturn = (trade: Trade) => {
    if (trade.status === 'ACTIVE' || !trade.exitPrice) return 0;
    return (trade.exitPrice - trade.entryPrice) * trade.quantity;
  };

  const getReturnColor = (returnValue: number) => {
    if (returnValue > 0) return 'text-green-600';
    if (returnValue < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const handleDeleteClick = (trade: Trade) => {
    setDeleteConfirm({ isOpen: true, trade });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.trade) return;
    
    setIsDeleting(true);
    try {
      await onDeleteTrade(deleteConfirm.trade.id);
      setDeleteConfirm({ isOpen: false });
    } catch (error) {
      console.error('Delete trade error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMarkAsClosedClick = (trade: Trade) => {
    setMarkAsClosed({ isOpen: true, trade });
  };

  const handleMarkAsClosedSave = async (exitPrice: number, exitDate: string) => {
    if (!markAsClosed.trade || !onUpdateTrade) return;

    const updatedTrade: Omit<Trade, 'id'> = {
      ...markAsClosed.trade,
      status: 'CLOSED',
      exitPrice,
      exitDate
    };

    await onUpdateTrade(markAsClosed.trade.id, updatedTrade);
    setMarkAsClosed({ isOpen: false });
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
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Type</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Quantity</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Entry Price</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Exit Price</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Entry Date</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Return</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {trades.map((trade) => {
                const returnValue = calculateReturn(trade);
                return (
                  <tr key={trade.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {trade.status === 'ACTIVE' ? (
                          <div className="flex items-center space-x-2">
                            <Circle className="w-4 h-4 text-blue-500 fill-current" />
                            <span className="text-sm font-medium text-blue-600">🔄 Active</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-600">✅ Closed</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-gray-900">{trade.symbol}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1">
                        {trade.type === 'BUY' ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${
                          trade.type === 'BUY' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {trade.type}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-900">{trade.quantity}</td>
                    <td className="py-4 px-6 text-gray-900">{formatCurrency(trade.entryPrice)}</td>
                    <td className="py-4 px-6 text-gray-900">
                      {trade.exitPrice ? formatCurrency(trade.exitPrice) : '-'}
                    </td>
                    <td className="py-4 px-6 text-gray-600">{formatDate(trade.entryDate)}</td>
                    <td className="py-4 px-6">
                      <span className={`font-semibold ${getReturnColor(returnValue)}`}>
                        {trade.status === 'CLOSED' ? formatCurrency(returnValue) : '-'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {trade.status === 'ACTIVE' && onUpdateTrade && (
                          <button
                            onClick={() => handleMarkAsClosedClick(trade)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Mark as Closed"
                          >
                            <Target className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onEditTrade(trade)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit Trade"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(trade)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete Trade"
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
        title="Delete Trade"
        message={`Are you sure you want to delete the ${deleteConfirm.trade?.symbol} trade? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />

      {/* Mark as Closed Modal */}
      {markAsClosed.trade && (
        <MarkAsClosedModal
          isOpen={markAsClosed.isOpen}
          onClose={() => setMarkAsClosed({ isOpen: false })}
          onSave={handleMarkAsClosedSave}
          stockSymbol={markAsClosed.trade.symbol}
          entryPrice={markAsClosed.trade.entryPrice}
          entryDate={markAsClosed.trade.entryDate}
          quantity={markAsClosed.trade.quantity}
        />
      )}
    </>
  );
}