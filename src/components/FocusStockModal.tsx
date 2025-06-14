import React, { useState, useEffect } from 'react';
import { FocusStock } from '../types/FocusStock';
import { X, Target, AlertCircle } from 'lucide-react';

interface FocusStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stock: Omit<FocusStock, 'id'>) => void;
  stock?: FocusStock;
}

export default function FocusStockModal({ isOpen, onClose, onSave, stock }: FocusStockModalProps) {
  const [formData, setFormData] = useState({
    symbol: '',
    targetPrice: '',
    currentPrice: '',
    reason: '',
    dateAdded: '',
    tradeTaken: false,
    tradeDate: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (stock) {
      setFormData({
        symbol: stock.symbol,
        targetPrice: stock.targetPrice.toString(),
        currentPrice: stock.currentPrice.toString(),
        reason: stock.reason || '',
        dateAdded: stock.dateAdded,
        tradeTaken: stock.tradeTaken,
        tradeDate: stock.tradeDate || '',
        notes: stock.notes || ''
      });
    } else {
      setFormData({
        symbol: '',
        targetPrice: '',
        currentPrice: '',
        reason: '',
        dateAdded: new Date().toISOString().split('T')[0],
        tradeTaken: false,
        tradeDate: '',
        notes: ''
      });
    }
    setErrors({});
  }, [stock, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Symbol is required';
    }

    if (!formData.currentPrice || parseFloat(formData.currentPrice) <= 0) {
      newErrors.currentPrice = 'Current price must be greater than 0';
    }

    if (!formData.targetPrice || parseFloat(formData.targetPrice) <= 0) {
      newErrors.targetPrice = 'Target price must be greater than 0';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    }

    if (!formData.dateAdded) {
      newErrors.dateAdded = 'Date added is required';
    }

    if (formData.tradeTaken && !formData.tradeDate) {
      newErrors.tradeDate = 'Trade date is required when trade is taken';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const stockData: Omit<FocusStock, 'id'> = {
      symbol: formData.symbol.toUpperCase().trim(),
      targetPrice: parseFloat(formData.targetPrice),
      currentPrice: parseFloat(formData.currentPrice),
      reason: formData.reason.trim(),
      dateAdded: formData.dateAdded,
      tradeTaken: formData.tradeTaken,
      tradeDate: formData.tradeDate || undefined,
      notes: formData.notes.trim() || undefined
    };

    onSave(stockData);
    onClose();
  };

  const handleInputChange = (field: string, value: string | boolean) => {
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
            {stock ? 'Edit Focus Stock' : 'Add Focus Stock'}
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
              placeholder="RELIANCE"
              required
            />
            {errors.symbol && <p className="mt-1 text-sm text-red-600">{errors.symbol}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.currentPrice}
                onChange={(e) => handleInputChange('currentPrice', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.currentPrice ? 'border-red-500' : 'border-gray-300'
                }`}
                min="0"
                required
              />
              {errors.currentPrice && <p className="mt-1 text-sm text-red-600">{errors.currentPrice}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.targetPrice}
                onChange={(e) => handleInputChange('targetPrice', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.targetPrice ? 'border-red-500' : 'border-gray-300'
                }`}
                min="0"
                required
              />
              {errors.targetPrice && <p className="mt-1 text-sm text-red-600">{errors.targetPrice}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Focus *
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.reason ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Technical breakout, earnings play, etc."
              required
              maxLength={200}
            />
            {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Added *
            </label>
            <input
              type="date"
              value={formData.dateAdded}
              onChange={(e) => handleInputChange('dateAdded', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.dateAdded ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.dateAdded && <p className="mt-1 text-sm text-red-600">{errors.dateAdded}</p>}
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="tradeTaken"
              checked={formData.tradeTaken}
              onChange={(e) => handleInputChange('tradeTaken', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="tradeTaken" className="text-sm font-medium text-gray-700">
              Trade Taken
            </label>
          </div>

          {formData.tradeTaken && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trade Date *
              </label>
              <input
                type="date"
                value={formData.tradeDate}
                onChange={(e) => handleInputChange('tradeDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.tradeDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.tradeDate && <p className="mt-1 text-sm text-red-600">{errors.tradeDate}</p>}
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
              placeholder="Additional notes about this stock..."
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
              {stock ? 'Update' : 'Add'} Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}