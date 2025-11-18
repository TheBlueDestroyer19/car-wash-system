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

      if (user && user.role === 'admin' && user.shop) {
        const res = await fetch(`/api/queue?shopId=${user.shop}`);
        if (!res.ok) throw new Error('Failed to fetch queue');
        const data = await res.json();
        setQueue(data);
      } else {
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
      if (token) headers['Authorization'] = `Bearer ${token}`;

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
      if (token) headers['Authorization'] = `Bearer ${token}`;

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
        return 'tile waiting ui-elevated';
      case 'IN_SERVICE':
        return 'tile in-service ui-elevated';
      case 'COMPLETED':
        return 'tile completed ui-elevated';
      case 'CANCELLED':
        return 'tile cancelled ui-elevated';
      default:
        return 'tile ui-elevated';
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="dashboard fade-in">
        <p>This page is for admins only.</p>
      </div>
    );
  }

  return (
    <div className="dashboard fade-in ui-page">
      {/* PAGE HEADER */}
      <section className="dashboard-header ui-section">
        <h2 className="section-title">My Shop&apos;s Queue</h2>

        {user && (
          <p className="user-note subtle-text">
            Managing: <strong>{user.name}</strong>
            <br />
            Shop ID: {user.shop}
          </p>
        )}

        {loading && <p className="loading-text">Loading queue...</p>}
        {error && <p className="error">{error}</p>}
      </section>

      {/* QUEUE GRID */}
      <section className="queue-section ui-section">
        <div className="queue-grid fade-in-slow">
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

                <p className="status-label">
                  {token.status}
                </p>
              </div>

              <div className="tile-actions">
                {token.status === 'WAITING' && (
                  <button
                    className="action-button ui-hover-scale"
                    onClick={() => handleChangeStatus(token._id, 'IN_SERVICE')}
                  >
                    Start Service
                  </button>
                )}

                {token.status === 'IN_SERVICE' && (
                  <button
                    className="action-button ui-hover-scale"
                    onClick={() => handleChangeStatus(token._id, 'COMPLETED')}
                  >
                    Mark Completed
                  </button>
                )}
              </div>
            </div>
          ))}

          {queue.length === 0 && !loading && (
            <p className="empty-text fade-in">No active tokens for today.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default MinimalDashboard;
