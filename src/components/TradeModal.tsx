import React, { useState, useEffect } from 'react';
import { Trade } from '../types/Trade';
import { X, TrendingUp, TrendingDown } from 'lucide-react';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trade: Omit<Trade, 'id'>) => void;
  trade?: Trade;
}

export default function TradeModal({ isOpen, onClose, onSave, trade }: TradeModalProps) {
  const [formData, setFormData] = useState({
    symbol: '',
    type: 'BUY' as 'BUY' | 'SELL',
    entryPrice: '',
    exitPrice: '',
    quantity: '1',
    entryDate: '',
    exitDate: '',
    status: 'ACTIVE' as 'ACTIVE' | 'CLOSED',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (trade) {
      setFormData({
        symbol: trade.symbol,
        type: trade.type,
        entryPrice: trade.entryPrice.toString(),
        exitPrice: trade.exitPrice?.toString() || '',
        quantity: trade.quantity.toString(),
        entryDate: trade.entryDate,
        exitDate: trade.exitDate || '',
        status: trade.status,
        notes: trade.notes || ''
      });
    } else {
      setFormData({
        symbol: '',
        type: 'BUY',
        entryPrice: '',
        exitPrice: '',
        quantity: '1',
        entryDate: new Date().toISOString().split('T')[0],
        exitDate: '',
        status: 'ACTIVE',
        notes: ''
      });
    }
    setErrors({});
  }, [trade, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Symbol is required';
    }

    if (!formData.entryPrice || parseFloat(formData.entryPrice) <= 0) {
      newErrors.entryPrice = 'Entry price must be greater than 0';
    }

    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (!formData.entryDate) {
      newErrors.entryDate = 'Entry date is required';
    }

    if (formData.status === 'CLOSED') {
      if (!formData.exitPrice || parseFloat(formData.exitPrice) <= 0) {
        newErrors.exitPrice = 'Exit price is required for closed trades';
      }
      if (!formData.exitDate) {
        newErrors.exitDate = 'Exit date is required for closed trades';
      }
      if (formData.exitDate && formData.entryDate && formData.exitDate < formData.entryDate) {
        newErrors.exitDate = 'Exit date must be after entry date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const tradeData: Omit<Trade, 'id'> = {
      symbol: formData.symbol.toUpperCase().trim(),
      type: formData.type,
      entryPrice: parseFloat(formData.entryPrice),
      exitPrice: formData.exitPrice ? parseFloat(formData.exitPrice) : undefined,
      quantity: parseInt(formData.quantity),
      entryDate: formData.entryDate,
      exitDate: formData.exitDate || undefined,
      status: formData.status,
      notes: formData.notes.trim() || undefined
    };

    onSave(tradeData);
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {trade ? 'Edit Trade' : 'Add New Trade'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Symbol *
            </label>
            <input
              type="text"
              value={formData.symbol}
              onChange={(e) => handleInputChange('symbol', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.symbol ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="AAPL"
              required
            />
            {errors.symbol && <p className="mt-1 text-sm text-red-600">{errors.symbol}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleInputChange('type', 'BUY')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg border transition-colors ${
                  formData.type === 'BUY'
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>BUY</span>
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('type', 'SELL')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg border transition-colors ${
                  formData.type === 'SELL'
                    ? 'bg-red-50 border-red-500 text-red-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                <span>SELL</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.quantity ? 'border-red-500' : 'border-gray-300'
                }`}
                min="1"
                required
              />
              {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entry Price *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.entryPrice}
                onChange={(e) => handleInputChange('entryPrice', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.entryPrice ? 'border-red-500' : 'border-gray-300'
                }`}
                min="0"
                required
              />
              {errors.entryPrice && <p className="mt-1 text-sm text-red-600">{errors.entryPrice}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entry Date *
            </label>
            <input
              type="date"
              value={formData.entryDate}
              onChange={(e) => handleInputChange('entryDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.entryDate ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.entryDate && <p className="mt-1 text-sm text-red-600">{errors.entryDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ACTIVE">Active</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {formData.status === 'CLOSED' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exit Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.exitPrice}
                  onChange={(e) => handleInputChange('exitPrice', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.exitPrice ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="0"
                />
                {errors.exitPrice && <p className="mt-1 text-sm text-red-600">{errors.exitPrice}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exit Date *
                </label>
                <input
                  type="date"
                  value={formData.exitDate}
                  onChange={(e) => handleInputChange('exitDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.exitDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.exitDate && <p className="mt-1 text-sm text-red-600">{errors.exitDate}</p>}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Add any notes about this trade..."
              maxLength={500}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {trade ? 'Update' : 'Add'} Trade
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}