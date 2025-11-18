import React, { useEffect, useState } from 'react';

const REFRESH_INTERVAL_MS = 3000;

function MinimalDashboard({ token, user }) {
  const [queue, setQueue] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const fetchQueue = async () => {
    try {
      setLoading(true);
      // Admin should fetch their shop's tokens, customers don't use this
      if (user && user.role === 'admin' && user.shop) {
        const res = await fetch(`/api/queue?shopId=${user.shop}`);
        if (!res.ok) throw new Error('Failed to fetch queue');
        const data = await res.json();
        setQueue(data);
      } else {
        // This shouldn't be shown for customers, but handle gracefully
        setQueue([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching queue:', err);
      setError('Error fetching queue');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin' && user.shop) {
      fetchQueue();
      const intervalId = setInterval(fetchQueue, REFRESH_INTERVAL_MS);
      return () => clearInterval(intervalId);
    }
  }, [user]);

  const handleCreateToken = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/tokens', {
        method: 'POST',
        headers,
        body: JSON.stringify({ customerName, vehicleNumber })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create token');
      }

      setCustomerName('');
      setVehicleNumber('');
      fetchQueue();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not create token');
    } finally {
      setCreating(false);
    }
  };

  const handleChangeStatus = async (id, newStatus) => {
    try {
      setError('');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/tokens/${id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update status');
      }

      fetchQueue();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not update status');
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'WAITING':
        return 'tile waiting';
      case 'IN_SERVICE':
        return 'tile in-service';
      case 'COMPLETED':
        return 'tile completed';
      case 'CANCELLED':
        return 'tile cancelled';
      default:
        return 'tile';
    }
  };

  if (!user || user.role !== 'admin') {
    return <div className="dashboard"><p>This page is for admins only.</p></div>;
  }

  return (
    <div className="dashboard">
      <section className="queue-section">
        <h2>My Shop&apos;s Queue</h2>
        {user && (
          <p className="user-note">
            Managing: {user.name} - Shop ID: {user.shop}
          </p>
        )}
        {loading && <p>Loading queue...</p>}
        {error && <p className="error">{error}</p>}

        <div className="queue-grid">
          {queue.map((token) => (
            <div key={token._id} className={getStatusClass(token.status)}>
              <div className="tile-header">
                <span className="token-number">
                  Token #{token.tokenNumber}
                </span>
                {token.serviceBay && (
                  <span className="service-bay">Bay {token.serviceBay}</span>
                )}
              </div>
              <div className="tile-body">
                <p>{token.customerName || 'Walk-in'}</p>
                <p>{token.vehicleNumber || 'No vehicle info'}</p>
                <p className="status-label">{token.status}</p>
              </div>
              <div className="tile-actions">
                {token.status === 'WAITING' && (
                  <button
                    onClick={() => handleChangeStatus(token._id, 'IN_SERVICE')}
                  >
                    Start Service
                  </button>
                )}
                {token.status === 'IN_SERVICE' && (
                  <button
                    onClick={() => handleChangeStatus(token._id, 'COMPLETED')}
                  >
                    Mark Completed
                  </button>
                )}
              </div>
            </div>
          ))}
          {queue.length === 0 && !loading && (
            <p>No active tokens for today.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default MinimalDashboard;
