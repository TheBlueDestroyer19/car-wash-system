import React, { useState, useEffect } from 'react';
import './App.css';
import MinimalDashboard from './components/MinimalDashboard';
import Auth from './components/Auth';

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('authUser');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (authToken, authUser) => {
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('authUser', JSON.stringify(authUser));
  };

  const handleSignup = (authToken, authUser) => {
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('authUser', JSON.stringify(authUser));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  const [showAuth, setShowAuth] = useState(false);

  return (
    <div className="App">
      <div className="app-header">
        <h1>Local Car Wash - Token & Queue</h1>
        <div className="user-info">
          {user ? (
            <>
              <span>
                Welcome, {user.name} ({user.role})
              </span>
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
      {showAuth && !token ? (
        <Auth 
          onLogin={(authToken, authUser) => {
            handleLogin(authToken, authUser);
            setShowAuth(false);
          }} 
          onSignup={(authToken, authUser) => {
            handleSignup(authToken, authUser);
            setShowAuth(false);
          }}
          onClose={() => setShowAuth(false)}
        />
      ) : (
        <MinimalDashboard token={token} user={user} />
      )}
    </div>
  );
}

export default App;
