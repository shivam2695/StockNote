import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TradeTable from './components/TradeTable';
import TradeModal from './components/TradeModal';
import FocusStocks from './components/FocusStocks';
import AuthContainer from './components/AuthContainer';
import Header from './components/Header';
import WelcomeModal from './components/WelcomeModal';
import HealthCheck from './components/HealthCheck';
import { useTrades } from './hooks/useTrades';
import { useFocusStocks } from './hooks/useFocusStocks';
import { useAuth } from './hooks/useAuth';
import { Trade } from './types/Trade';
import { PlusCircle, Menu, X } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | undefined>();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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
    return (
      <>
        <AuthContainer onLogin={handleLogin} onSignUp={handleSignUp} />
        <HealthCheck />
      </>
    );
  }

  async function handleLogin(email: string, password: string) {
    await login(email, password);
    setShowWelcomeModal(true);
  }

  async function handleSignUp(name: string, email: string, password: string) {
    await signUp(name, email, password);
    setShowWelcomeModal(true);
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

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            trades={trades}
            stats={stats}
            focusStocks={focusStocks}
            onAddTrade={addTrade}
            onEditTrade={updateTrade}
            onDeleteTrade={deleteTrade}
            getTradesByMonth={getTradesByMonth}
          />
        );
      case 'trades':
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All Trades</h1>
                  <p className="text-gray-600 mt-1">Complete history of your trading activity</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 whitespace-nowrap"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Add Trade</span>
                </button>
              </div>
            </div>
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <TradeTable
                  trades={trades}
                  onEditTrade={handleEditTrade}
                  onDeleteTrade={deleteTrade}
                />
              </div>
            </div>
          </div>
        );
      case 'focus-stocks':
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              <FocusStocks
                stocks={focusStocks}
                onAddStock={addFocusStock}
                onEditStock={updateFocusStock}
                onDeleteStock={deleteFocusStock}
                onMarkTradeTaken={markTradeTaken}
              />
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600 mt-1">Deep insights into your trading performance</p>
            </div>
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <p className="text-gray-600">Advanced analytics features coming soon...</p>
              </div>
            </div>
          </div>
        );
      case 'calendar':
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Calendar</h1>
              <p className="text-gray-600 mt-1">View your trades in calendar format</p>
            </div>
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <p className="text-gray-600">Calendar view coming soon...</p>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-1">Manage your account and preferences</p>
            </div>
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <p className="text-gray-600">Settings panel coming soon...</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Health Check Component */}
      <HealthCheck />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative flex flex-col w-64 bg-white">
            <Sidebar activeTab={activeTab} onTabChange={(tab) => {
              setActiveTab(tab);
              setIsMobileMenuOpen(false);
            }} />
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="lg:ml-64">
        <Header 
          user={user!} 
          onLogout={logout} 
          onMenuToggle={handleMenuToggle}
          isMobileMenuOpen={isMobileMenuOpen}
        />
        {renderContent()}
      </div>

      <TradeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTrade}
        trade={editingTrade}
      />

      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        userName={user?.name || ''}
      />
    </div>
  );
}

export default App;