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
  const [currentPage, setCurrentPage] = useState('shops');
  const [selectedShop, setSelectedShop] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('authUser');

    if (savedToken && savedUser) {
      setToken(savedToken);
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);

      if (parsedUser?.role === 'admin') {
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

    if (authUser.role === 'admin') setCurrentPage('admin');
    else setCurrentPage('shops');
  };

  const handleSignup = (authToken, authUser) => {
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('authUser', JSON.stringify(authUser));
    setShowAuth(false);

    if (authUser.role === 'admin') setCurrentPage('admin');
    else setCurrentPage('shops');
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

    if (user && user.role === 'admin') {
      return <MinimalDashboard token={token} user={user} />;
    }

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

      {/* ===================== PREMIUM NAVBAR ===================== */}
      <nav className="lux-navbar">
        <div className="lux-brand">
          <h1>Car Wash Management</h1>
        </div>

        <div className="lux-nav-actions">
          {user ? (
            <>
              <span className="lux-user">
                {user.name} — <small>{user.role}</small>
              </span>

              {user.role === 'customer' && (
                <>
                  <button
                    onClick={() => setCurrentPage('shops')}
                    className={currentPage === 'shops' ? 'lux-link active' : 'lux-link'}
                  >
                    Centers
                  </button>

                  <button
                    onClick={() => setCurrentPage('orders')}
                    className={currentPage === 'orders' ? 'lux-link active' : 'lux-link'}
                  >
                    My Orders
                  </button>
                </>
              )}

              <button onClick={handleLogout} className="lux-logout">
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="lux-login"
            >
              Login / Sign Up
            </button>
          )}
        </div>
      </nav>
      {/* =========================================================== */}

      {renderContent()}
    </div>
  );
}

export default App;
