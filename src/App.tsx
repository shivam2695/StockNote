import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TradeTable from './components/TradeTable';
import TradeModal from './components/TradeModal';
import FocusStocks from './components/FocusStocks';
import Teams from './components/Teams';
import AuthContainer from './components/AuthContainer';
import Header from './components/Header';
import WelcomeModal from './components/WelcomeModal';
import HealthCheck from './components/HealthCheck';
import { useTrades } from './hooks/useTrades';
import { useFocusStocks } from './hooks/useFocusStocks';
import { useNotifications } from './hooks/useNotifications';
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

  const {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  } = useNotifications(user?.email);

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

  const handleSaveTrade = async (tradeData: Omit<Trade, 'id'>) => {
    try {
      if (editingTrade) {
        await updateTrade(editingTrade.id, tradeData);
        addNotification({
          type: 'trade_added',
          title: 'Trade Updated',
          message: `${tradeData.symbol} trade has been updated successfully`
        });
      } else {
        await addTrade(tradeData);
        addNotification({
          type: 'trade_added',
          title: 'New Trade Added',
          message: `${tradeData.symbol} trade has been added to your journal`
        });
      }
      setEditingTrade(undefined);
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Save trade error:', error);
      // Show error to user
      alert(error.message || 'Failed to save trade');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTrade(undefined);
  };

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Enhanced focus stock handlers with sync to journal
  const handleMarkFocusStockTaken = async (stockId: string, tradeTaken: boolean, tradeDate?: string) => {
    try {
      await markTradeTaken(stockId, tradeTaken, tradeDate);
      
      if (tradeTaken) {
        // Find the focus stock to sync to journal
        const focusStock = focusStocks.find(stock => stock.id === stockId);
        if (focusStock) {
          // Add to trading journal automatically
          const tradeData: Omit<Trade, 'id'> = {
            symbol: focusStock.symbol,
            type: 'BUY', // Default to BUY
            entryPrice: focusStock.currentPrice,
            quantity: 1, // Default quantity
            entryDate: tradeDate || new Date().toISOString().split('T')[0],
            status: 'ACTIVE',
            notes: `From Focus Stock: ${focusStock.reason}`
          };
          
          // Check if trade already exists to avoid duplicates
          const existingTrade = trades.find(trade => 
            trade.symbol === focusStock.symbol && 
            trade.entryDate === tradeData.entryDate
          );
          
          if (!existingTrade) {
            await addTrade(tradeData);
            addNotification({
              type: 'focus_taken',
              title: 'Focus Stock Taken',
              message: `${focusStock.symbol} has been marked as taken and added to your trading journal`
            });
          } else {
            addNotification({
              type: 'focus_taken',
              title: 'Focus Stock Taken',
              message: `${focusStock.symbol} has been marked as taken (trade already exists in journal)`
            });
          }
        }
      }
    } catch (error: any) {
      console.error('Mark focus stock taken error:', error);
      alert(error.message || 'Failed to update focus stock');
    }
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
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Trading Journal</h1>
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
                onMarkTradeTaken={handleMarkFocusStockTaken}
              />
            </div>
          </div>
        );
      case 'teams':
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              <Teams
                userEmail={user?.email || ''}
                onAddNotification={addNotification}
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
      case 'notifications':
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-1">Stay updated with your trading activity</p>
            </div>
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                {notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border ${
                          !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                            <p className="text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-blue-600 hover:text-blue-500 text-sm"
                              >
                                Mark as read
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="text-red-600 hover:text-red-500 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-center space-x-4 pt-4">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                      <button
                        onClick={clearAll}
                        className="text-red-600 hover:text-red-500 text-sm font-medium"
                      >
                        Clear all notifications
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No notifications yet</p>
                  </div>
                )}
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
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDeleteNotification={deleteNotification}
          onClearAllNotifications={clearAll}
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