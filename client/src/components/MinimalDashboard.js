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
      const res = await fetch('/api/queue');
      const data = await res.json();
      setQueue(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching queue:', err);
      setError('Error fetching queue');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const intervalId = setInterval(fetchQueue, REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, []);

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

  return (
    <div className="dashboard">
      <section className="new-token-section">
        <h2>Issue New Token</h2>
        {user && (
          <p className="user-note">
            Logged in as: {user.name} ({user.role})
          </p>
        )}
        {!user && (
          <p className="user-note">
            Creating token as walk-in customer. <a href="#login">Login</a> to associate with your account.
          </p>
        )}
        <form onSubmit={handleCreateToken} className="token-form">
          <input
            type="text"
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Vehicle Number"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
          />
          <button type="submit" disabled={creating}>
            {creating ? 'Creating...' : 'Create Token'}
          </button>
        </form>
      </section>

      <section className="queue-section">
        <h2>Today&apos;s Queue</h2>
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
              {user && user.role === 'admin' && (
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
              )}
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
