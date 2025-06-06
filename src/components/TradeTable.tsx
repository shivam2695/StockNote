import React from 'react';
import { Trade } from '../types/Trade';
import { TrendingUp, TrendingDown, Circle, CheckCircle, Edit, Trash2 } from 'lucide-react';

interface TradeTableProps {
  trades: Trade[];
  onEditTrade: (trade: Trade) => void;
  onDeleteTrade: (tradeId: string) => void;
}

export default function TradeTable({ trades, onEditTrade, onDeleteTrade }: TradeTableProps) {
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

  return (
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
                        <Circle className="w-4 h-4 text-green-500 fill-current" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-gray-500" />
                      )}
                      <span className={`text-sm font-medium ${
                        trade.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {trade.status}
                      </span>
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
                      <button
                        onClick={() => onEditTrade(trade)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteTrade(trade.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
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
  );
}