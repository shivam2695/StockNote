import React, { useState } from 'react';
import { Trade, TradeStats } from '../types/Trade';
import StatsCard from './StatsCard';
import TradeTable from './TradeTable';
import TradeModal from './TradeModal';
import { DollarSign, TrendingUp, Activity, PlusCircle, Calendar } from 'lucide-react';

interface DashboardProps {
  trades: Trade[];
  stats: TradeStats;
  onAddTrade: (trade: Omit<Trade, 'id'>) => void;
  onEditTrade: (tradeId: string, trade: Omit<Trade, 'id'>) => void;
  onDeleteTrade: (tradeId: string) => void;
  getTradesByMonth: (month: number, year: number) => Trade[];
}

export default function Dashboard({ 
  trades, 
  stats, 
  onAddTrade, 
  onEditTrade, 
  onDeleteTrade,
  getTradesByMonth 
}: DashboardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | undefined>();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setIsModalOpen(true);
  };

  const handleSaveTrade = (tradeData: Omit<Trade, 'id'>) => {
    if (editingTrade) {
      onEditTrade(editingTrade.id, tradeData);
    } else {
      onAddTrade(tradeData);
    }
    setEditingTrade(undefined);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTrade(undefined);
  };

  const currentMonthTrades = getTradesByMonth(selectedMonth, selectedYear);
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    return new Date(0, month).toLocaleString('en-US', { month: 'long' });
  };

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: getMonthName(i)
  }));

  const years = Array.from({ length: 5 }, (_, i) => selectedYear - 2 + i);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Records Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your trading performance and manage your portfolio</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Add Trade</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Investment"
          value={formatCurrency(stats.totalInvestment)}
          subtitle={`${stats.totalTrades} total trades`}
          icon={DollarSign}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatsCard
          title="Total Return"
          value={formatCurrency(stats.totalReturn)}
          subtitle={`${stats.closedTrades} closed trades`}
          icon={TrendingUp}
          gradient={stats.totalReturn >= 0 ? "bg-gradient-to-br from-green-500 to-green-600" : "bg-gradient-to-br from-red-500 to-red-600"}
        />
        <StatsCard
          title="Monthly Return"
          value={formatCurrency(stats.monthlyReturn)}
          subtitle={`${getMonthName(new Date().getMonth())} ${new Date().getFullYear()}`}
          icon={Activity}
          gradient={stats.monthlyReturn >= 0 ? "bg-gradient-to-br from-emerald-500 to-emerald-600" : "bg-gradient-to-br from-orange-500 to-orange-600"}
        />
      </div>

      {/* Month Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Trades by Month</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {currentMonthTrades.length > 0 ? (
          <TradeTable
            trades={currentMonthTrades}
            onEditTrade={handleEditTrade}
            onDeleteTrade={onDeleteTrade}
          />
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No trades found</h3>
            <p className="text-gray-600">No trades were made in {getMonthName(selectedMonth)} {selectedYear}</p>
          </div>
        )}
      </div>

      {/* Recent Trades */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Trades</h2>
        <TradeTable
          trades={trades.slice(-5)}
          onEditTrade={handleEditTrade}
          onDeleteTrade={onDeleteTrade}
        />
      </div>

      {/* Trade Modal */}
      <TradeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTrade}
        trade={editingTrade}
      />
    </div>
  );
}