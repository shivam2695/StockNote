import React, { useState, useEffect } from 'react';
import { Trade } from '../types/Trade';
import { X, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trade: Omit<Trade, 'id'>) => Promise<void>;
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Symbol validation
    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Symbol is required';
    } else if (formData.symbol.trim().length > 10) {
      newErrors.symbol = 'Symbol cannot exceed 10 characters';
    }

    // Entry price validation
    if (!formData.entryPrice) {
      newErrors.entryPrice = 'Entry price is required';
    } else {
      const price = parseFloat(formData.entryPrice);
      if (isNaN(price) || price <= 0) {
        newErrors.entryPrice = 'Entry price must be greater than 0';
      }
    }

    // Quantity validation
    if (!formData.quantity) {
      newErrors.quantity = 'Quantity is required';
    } else {
      const qty = parseInt(formData.quantity);
      if (isNaN(qty) || qty <= 0) {
        newErrors.quantity = 'Quantity must be greater than 0';
      }
    }

    // Entry date validation
    if (!formData.entryDate) {
      newErrors.entryDate = 'Entry date is required';
    } else {
      const entryDate = new Date(formData.entryDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      if (entryDate > today) {
        newErrors.entryDate = 'Entry date cannot be in the future';
      }
    }

    // Closed trade validations
    if (formData.status === 'CLOSED') {
      if (!formData.exitPrice || formData.exitPrice.trim() === '') {
        newErrors.exitPrice = 'Exit price is required for closed trades';
      } else {
        const exitPrice = parseFloat(formData.exitPrice);
        if (isNaN(exitPrice) || exitPrice <= 0) {
          newErrors.exitPrice = 'Exit price must be greater than 0';
        }
      }

      if (!formData.exitDate || formData.exitDate.trim() === '') {
        newErrors.exitDate = 'Exit date is required for closed trades';
      } else if (formData.entryDate) {
        const entryDate = new Date(formData.entryDate);
        const exitDate = new Date(formData.exitDate);
        if (exitDate < entryDate) {
          newErrors.exitDate = 'Exit date must be after entry date';
        }
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (exitDate > today) {
          newErrors.exitDate = 'Exit date cannot be in the future';
        }
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
      const tradeData: Omit<Trade, 'id'> = {
        symbol: formData.symbol.toUpperCase().trim(),
        type: formData.type,
        entryPrice: parseFloat(formData.entryPrice),
        exitPrice: formData.status === 'CLOSED' && formData.exitPrice ? parseFloat(formData.exitPrice) : undefined,
        quantity: parseInt(formData.quantity),
        entryDate: formData.entryDate,
        exitDate: formData.status === 'CLOSED' && formData.exitDate ? formData.exitDate : undefined,
        status: formData.status,
        notes: formData.notes.trim() || undefined
      };

      // Additional validation before sending
      if (tradeData.status === 'CLOSED') {
        if (!tradeData.exitPrice || tradeData.exitPrice <= 0) {
          setErrors({ exitPrice: 'Exit price is required for closed trades' });
          return;
        }
        if (!tradeData.exitDate) {
          setErrors({ exitDate: 'Exit date is required for closed trades' });
          return;
        }
      }

      console.log('Submitting trade data:', tradeData);
      await onSave(tradeData);
      onClose();
    } catch (error: any) {
      console.error('Trade save error:', error);
      // Error is handled by parent component, but we can also show it here
      if (error.message.includes('Exit price is required')) {
        setErrors({ exitPrice: 'Exit price is required for closed trades' });
      } else if (error.message.includes('Exit date is required')) {
        setErrors({ exitDate: 'Exit date is required for closed trades' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleStatusChange = (newStatus: 'ACTIVE' | 'CLOSED') => {
    setFormData(prev => ({ 
      ...prev, 
      status: newStatus,
      // Auto-fill exit date with today if closing trade
      exitDate: newStatus === 'CLOSED' && !prev.exitDate ? new Date().toISOString().split('T')[0] : prev.exitDate
    }));
    // Clear related errors when status changes
    if (newStatus === 'ACTIVE') {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.exitPrice;
        delete newErrors.exitDate;
        return newErrors;
      });
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
            <input
              type="text"
              value={formData.symbol}
              onChange={(e) => handleInputChange('symbol', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.symbol ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="AAPL"
              maxLength={10}
              required
              disabled={isSubmitting}
            />
            {errors.symbol && (
              <div className="mt-1 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-sm text-red-600">{errors.symbol}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleInputChange('type', 'BUY')}
                disabled={isSubmitting}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg border transition-colors ${
                  formData.type === 'BUY'
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>BUY</span>
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('type', 'SELL')}
                disabled={isSubmitting}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg border transition-colors ${
                  formData.type === 'SELL'
                    ? 'bg-red-50 border-red-500 text-red-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                disabled={isSubmitting}
              />
              {errors.quantity && (
                <div className="mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-600">{errors.quantity}</p>
                </div>
              )}
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
                disabled={isSubmitting}
              />
              {errors.entryPrice && (
                <div className="mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-600">{errors.entryPrice}</p>
                </div>
              )}
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
              max={new Date().toISOString().split('T')[0]}
              required
              disabled={isSubmitting}
            />
            {errors.entryDate && (
              <div className="mt-1 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-sm text-red-600">{errors.entryDate}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleStatusChange(e.target.value as 'ACTIVE' | 'CLOSED')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            >
              <option value="ACTIVE">Active</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {formData.status === 'CLOSED' && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Closing Trade Details
              </div>
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
                    placeholder="0.00"
                    disabled={isSubmitting}
                    required
                  />
                  {errors.exitPrice && (
                    <div className="mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <p className="text-sm text-red-600">{errors.exitPrice}</p>
                    </div>
                  )}
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
                    min={formData.entryDate}
                    max={new Date().toISOString().split('T')[0]}
                    disabled={isSubmitting}
                    required
                  />
                  {errors.exitDate && (
                    <div className="mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <p className="text-sm text-red-600">{errors.exitDate}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Show P&L calculation if both prices are available */}
              {formData.entryPrice && formData.exitPrice && formData.quantity && (
                <div className="mt-3 p-3 bg-white rounded border">
                  <div className="text-sm font-medium text-gray-700 mb-2">P&L Preview</div>
                  {(() => {
                    const entryPrice = parseFloat(formData.entryPrice);
                    const exitPrice = parseFloat(formData.exitPrice);
                    const quantity = parseInt(formData.quantity);
                    const pnl = (exitPrice - entryPrice) * quantity;
                    const pnlPercentage = ((exitPrice - entryPrice) / entryPrice) * 100;
                    
                    return (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {quantity} × (₹{exitPrice} - ₹{entryPrice})
                        </span>
                        <span className={`text-sm font-semibold ${
                          pnl >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ₹{pnl.toFixed(2)} ({pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%)
                        </span>
                      </div>
                    );
                  })()}
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
              placeholder="Add any notes about this trade..."
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
              {isSubmitting ? 'Saving...' : trade ? 'Update' : 'Add'} Trade
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}