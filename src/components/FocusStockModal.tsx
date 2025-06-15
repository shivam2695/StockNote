import React, { useState, useEffect } from 'react';
import { FocusStock } from '../types/FocusStock';
import { X, Target, AlertCircle } from 'lucide-react';
import StockSearchInput from './StockSearchInput';
import CMPDisplay from './CMPDisplay';

interface FocusStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stock: Omit<FocusStock, 'id'>) => Promise<void>;
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
    notes: '',
    tag: '' as 'worked' | 'missed' | 'failed' | 'watch' | ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCMP, setShowCMP] = useState(false);

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
        notes: stock.notes || '',
        tag: stock.tag || ''
      });
      setShowCMP(true);
    } else {
      setFormData({
        symbol: '',
        targetPrice: '',
        currentPrice: '',
        reason: '',
        dateAdded: new Date().toISOString().split('T')[0],
        tradeTaken: false,
        tradeDate: '',
        notes: '',
        tag: ''
      });
      setShowCMP(false);
    }
    setErrors({});
  }, [stock, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Symbol validation
    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Symbol is required';
    } else if (formData.symbol.trim().length > 20) {
      newErrors.symbol = 'Symbol cannot exceed 20 characters';
    }

    // Current price validation
    if (!formData.currentPrice) {
      newErrors.currentPrice = 'Current price is required';
    } else {
      const price = parseFloat(formData.currentPrice);
      if (isNaN(price) || price <= 0) {
        newErrors.currentPrice = 'Current price must be greater than 0';
      }
    }

    // Target price validation
    if (!formData.targetPrice) {
      newErrors.targetPrice = 'Target price is required';
    } else {
      const price = parseFloat(formData.targetPrice);
      if (isNaN(price) || price <= 0) {
        newErrors.targetPrice = 'Target price must be greater than 0';
      }
    }

    // Reason validation
    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    } else if (formData.reason.trim().length > 200) {
      newErrors.reason = 'Reason cannot exceed 200 characters';
    }

    // Date added validation
    if (!formData.dateAdded) {
      newErrors.dateAdded = 'Date added is required';
    } else {
      const dateAdded = new Date(formData.dateAdded);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (dateAdded > today) {
        newErrors.dateAdded = 'Date added cannot be in the future';
      }
    }

    // Trade taken validation
    if (formData.tradeTaken && !formData.tradeDate) {
      newErrors.tradeDate = 'Trade date is required when trade is taken';
    } else if (formData.tradeDate) {
      const tradeDate = new Date(formData.tradeDate);
      const dateAdded = new Date(formData.dateAdded);
      if (tradeDate < dateAdded) {
        newErrors.tradeDate = 'Trade date cannot be before date added';
      }
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (tradeDate > today) {
        newErrors.tradeDate = 'Trade date cannot be in the future';
      }
    }

    // Notes validation
    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'Notes cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const stockData: Omit<FocusStock, 'id'> = {
        symbol: formData.symbol.toUpperCase().trim(),
        targetPrice: parseFloat(formData.targetPrice),
        currentPrice: parseFloat(formData.currentPrice),
        reason: formData.reason.trim(),
        dateAdded: formData.dateAdded,
        tradeTaken: formData.tradeTaken,
        tradeDate: formData.tradeDate || undefined,
        notes: formData.notes.trim() || undefined,
        tag: formData.tag || undefined
      };

      await onSave(stockData);
      onClose();
    } catch (error: any) {
      // Error is handled by parent component
      console.error('Focus stock save error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSymbolChange = (symbol: string) => {
    handleInputChange('symbol', symbol);
    setShowCMP(symbol.trim().length > 0);
  };

  const tagOptions = [
    { value: '', label: 'No Tag', color: 'bg-gray-100 text-gray-800' },
    { value: 'worked', label: 'Worked', color: 'bg-green-100 text-green-800' },
    { value: 'missed', label: 'Missed', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800' },
    { value: 'watch', label: 'Watch', color: 'bg-blue-100 text-blue-800' }
  ];

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
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Symbol *
            </label>
            <StockSearchInput
              value={formData.symbol}
              onChange={handleSymbolChange}
              placeholder="Search for stocks..."
              className={errors.symbol ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.symbol && (
              <div className="mt-1 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-sm text-red-600">{errors.symbol}</p>
              </div>
            )}
            
            {/* Current Market Price */}
            {showCMP && formData.symbol && (
              <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Market Price:</span>
                  <CMPDisplay 
                    symbol={formData.symbol} 
                    showChange={true}
                    className="text-right"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Price ($) *
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
                disabled={isSubmitting}
              />
              {errors.currentPrice && (
                <div className="mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-600">{errors.currentPrice}</p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Price ($) *
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
                disabled={isSubmitting}
              />
              {errors.targetPrice && (
                <div className="mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-600">{errors.targetPrice}</p>
                </div>
              )}
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
              maxLength={200}
              required
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.reason && (
                <div className="flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-600">{errors.reason}</p>
                </div>
              )}
              <p className="text-xs text-gray-500 ml-auto">
                {formData.reason.length}/200
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tag
            </label>
            <div className="grid grid-cols-2 gap-2">
              {tagOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleInputChange('tag', option.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    formData.tag === option.value
                      ? `${option.color} border-current`
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                  disabled={isSubmitting}
                >
                  {option.label}
                </button>
              ))}
            </div>
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
              max={new Date().toISOString().split('T')[0]}
              required
              disabled={isSubmitting}
            />
            {errors.dateAdded && (
              <div className="mt-1 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-sm text-red-600">{errors.dateAdded}</p>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="tradeTaken"
              checked={formData.tradeTaken}
              onChange={(e) => handleInputChange('tradeTaken', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={isSubmitting}
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
                min={formData.dateAdded}
                max={new Date().toISOString().split('T')[0]}
                disabled={isSubmitting}
              />
              {errors.tradeDate && (
                <div className="mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-600">{errors.tradeDate}</p>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.notes ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={3}
              placeholder="Additional notes about this stock..."
              maxLength={500}
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.notes && (
                <div className="flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-600">{errors.notes}</p>
                </div>
              )}
              <p className="text-xs text-gray-500 ml-auto">
                {formData.notes.length}/500
              </p>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : stock ? 'Update' : 'Add'} Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}