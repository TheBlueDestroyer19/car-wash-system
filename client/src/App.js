import React, { useState, useEffect } from 'react';
import './App.css';
import ShopDashboard from './components/ShopDashboard';
import TokenForm from './components/TokenForm';
import Orders from './components/Orders';
import MinimalDashboard from './components/MinimalDashboard';
import Auth from './components/Auth';

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('shops'); // 'shops', 'tokenForm', 'orders', 'admin'
  const [selectedShop, setSelectedShop] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('authUser');
    if (savedToken && savedUser) {
      setToken(savedToken);
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      // If admin, show admin dashboard; otherwise show shops
      if (parsedUser && parsedUser.role === 'admin') {
        setCurrentPage('admin');
      } else {
        setCurrentPage('shops');
      }
    }
  }, []);

  const handleLogin = (authToken, authUser) => {
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('authUser', JSON.stringify(authUser));
    setShowAuth(false);
    // Redirect based on role
    if (authUser.role === 'admin') {
      setCurrentPage('admin');
    } else {
      setCurrentPage('shops');
    }
  };

  const handleSignup = (authToken, authUser) => {
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('authUser', JSON.stringify(authUser));
    setShowAuth(false);
    // Redirect based on role
    if (authUser.role === 'admin') {
      setCurrentPage('admin');
    } else {
      setCurrentPage('shops');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setCurrentPage('shops');
    setSelectedShop(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  const handleSelectShop = (shop) => {
    setSelectedShop(shop);
    setCurrentPage('tokenForm');
  };

  const handleTokenSuccess = (newToken) => {
    // After successful token creation, go back to shops or show success
    setCurrentPage('shops');
    setSelectedShop(null);
    alert(`Token #${newToken.tokenNumber} created successfully!`);
  };

  const renderContent = () => {
    if (showAuth && !token) {
      return (
        <Auth 
          onLogin={handleLogin}
          onSignup={handleSignup}
          onClose={() => setShowAuth(false)}
        />
      );
    }

    // Admin sees their dashboard
    if (user && user.role === 'admin') {
      return <MinimalDashboard token={token} user={user} />;
    }

    // Customer navigation
    switch (currentPage) {
      case 'tokenForm':
        return (
          <TokenForm
            shop={selectedShop}
            onSuccess={handleTokenSuccess}
            onBack={() => {
              setCurrentPage('shops');
              setSelectedShop(null);
            }}
          />
        );
      case 'orders':
        return <Orders token={token} />;
      case 'shops':
      default:
        return <ShopDashboard onSelectShop={handleSelectShop} />;
    }
  };

  return (
    <div className="App">
      <div className="app-header">
        <h1>Car Wash Management System</h1>
        <div className="user-info">
          {user ? (
            <>
              <span>
                Welcome, {user.name} ({user.role})
              </span>
              {user.role === 'customer' && (
                <>
                  <button
                    onClick={() => setCurrentPage('shops')}
                    className={currentPage === 'shops' ? 'nav-button active' : 'nav-button'}
                  >
                    Centers
                  </button>
                  <button
                    onClick={() => setCurrentPage('orders')}
                    className={currentPage === 'orders' ? 'nav-button active' : 'nav-button'}
                  >
                    My Orders
                  </button>
                </>
              )}
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </>
          ) : (
            <button onClick={() => setShowAuth(true)} className="login-button">
              Login / Sign Up
            </button>
          )}
        </div>
      </div>
      {renderContent()}
    </div>
  );
}

export default App;
