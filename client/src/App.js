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
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

  const handleLogin = (authToken, authUser) => {
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('authUser', JSON.stringify(authUser));
    setShowAuth(false);
    closeMobileMenu();

    if (authUser.role === 'admin') setCurrentPage('admin');
    else setCurrentPage('shops');
  };

  const handleSignup = (authToken, authUser) => {
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('authUser', JSON.stringify(authUser));
    setShowAuth(false);
    closeMobileMenu();

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
    closeMobileMenu();
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

  const openAuthModal = () => {
    setShowAuth(true);
    closeMobileMenu();
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
    if (page !== 'tokenForm') setSelectedShop(null);
    closeMobileMenu();
  };

  const renderNavButtons = (isMobile = false) => {
    const linkClass = (page) =>
      `${isMobile ? 'lux-link mobile' : 'lux-link'} ${
        currentPage === page ? 'active' : ''
      }`;

    if (user) {
      return (
        <>
          <span className={isMobile ? 'lux-user mobile' : 'lux-user'}>
            {user.name} — <small>{user.role}</small>
          </span>

          {user.role === 'customer' && (
            <>
              <button
                onClick={() => navigateTo('shops')}
                className={linkClass('shops')}
              >
                Centers
              </button>

              <button
                onClick={() => navigateTo('orders')}
                className={linkClass('orders')}
              >
                My Orders
              </button>
            </>
          )}

          <button onClick={handleLogout} className="lux-logout">
            Logout
          </button>
        </>
      );
    }

    return (
      <button onClick={openAuthModal} className="lux-login">
        Login / Sign Up
      </button>
    );
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
          {renderNavButtons()}
        </div>

        <button
          className={`lux-burger ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          <span />
        </button>
      </nav>
      {/* =========================================================== */}

      <div
        className={`lux-mobile-backdrop ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={closeMobileMenu}
      />
      <aside className={`lux-mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="lux-drawer-header">
          <h2>Menu</h2>
          <button
            className="lux-close-drawer"
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
        <div className="lux-mobile-actions">{renderNavButtons(true)}</div>
      </aside>

      {renderContent()}
    </div>
  );
}

export default App;
