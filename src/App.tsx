import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TradeTable from './components/TradeTable';
import TradeModal from './components/TradeModal';
import FocusStocks from './components/FocusStocks';
import AuthContainer from './components/AuthContainer';
import Header from './components/Header';
import { useTrades } from './hooks/useTrades';
import { useFocusStocks } from './hooks/useFocusStocks';
import { useAuth } from './hooks/useAuth';
import { Trade } from './types/Trade';
import { PlusCircle } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | undefined>();
  
  const { isAuthenticated, user, login, logout, signUp } = useAuth();
  
  // Pass user email to hooks for user-specific data
  const { 
    trades, 
    addTrade, 
    updateTrade, 
    deleteTrade, 
    calculateStats,
    getTradesByMonth 
  } = useTrades(user?.email);

  const {
    focusStocks,
    addFocusStock,
    updateFocusStock,
    deleteFocusStock,
    markTradeTaken
  } = useFocusStocks(user?.email);

  const stats = calculateStats();

  // Show auth container if not authenticated
  if (!isAuthenticated) {
    return <AuthContainer onLogin={login} onSignUp={signUp} />;
  }

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setIsModalOpen(true);
  };

  const handleSaveTrade = (tradeData: Omit<Trade, 'id'>) => {
    if (editingTrade) {
      updateTrade(editingTrade.id, tradeData);
    } else {
      addTrade(tradeData);
    }
    setEditingTrade(undefined);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTrade(undefined);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            trades={trades}
            stats={stats}
            onAddTrade={addTrade}
            onEditTrade={updateTrade}
            onDeleteTrade={deleteTrade}
            getTradesByMonth={getTradesByMonth}
          />
        );
      case 'trades':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">All Trades</h1>
                <p className="text-gray-600 mt-1">Complete history of your trading activity</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Add Trade</span>
              </button>
            </div>
            <TradeTable
              trades={trades}
              onEditTrade={handleEditTrade}
              onDeleteTrade={deleteTrade}
            />
          </div>
        );
      case 'focus-stocks':
        return (
          <FocusStocks
            stocks={focusStocks}
            onAddStock={addFocusStock}
            onEditStock={updateFocusStock}
            onDeleteStock={deleteFocusStock}
            onMarkTradeTaken={markTradeTaken}
          />
        );
      case 'analytics':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <p className="text-gray-600">Analytics features coming soon...</p>
            </div>
          </div>
        );
      case 'calendar':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <p className="text-gray-600">Calendar view coming soon...</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <p className="text-gray-600">Settings panel coming soon...</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="ml-64">
        <Header user={user!} onLogout={logout} />
        <div className="p-8">
          {renderContent()}
        </div>
      </div>

      <TradeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTrade}
        trade={editingTrade}
      />
    </div>
  );
}

export default App;