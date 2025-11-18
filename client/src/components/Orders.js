import React, { useEffect, useState } from 'react';
import './Orders.css';

function Orders({ token: authToken }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authToken) {
      fetchOrders();
    } else {
      setError('Please login to view your orders');
      setLoading(false);
    }
  }, [authToken]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${authToken}` };
      const res = await fetch('/api/orders', { headers });

      if (!res.ok) throw new Error('Failed to fetch orders');

      const data = await res.json();
      setOrders(data);
      setError('');
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load your orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'WAITING':
        return 'status-waiting';
      case 'IN_SERVICE':
        return 'status-in-service';
      case 'COMPLETED':
        return 'status-completed';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="orders-page fade-in">
        <p className="loading-text">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-page fade-in ui-page">
      {/* ===== Page Header ===== */}
      <h2 className="section-title">My Orders</h2>

      {error && <p className="error">{error}</p>}

      {!authToken && (
        <div className="login-prompt ui-elevated fade-in-slight">
          <p>Please login to view your orders.</p>
        </div>
      )}

      {authToken && orders.length === 0 && !error && (
        <p className="empty-text fade-in">You don't have any orders yet.</p>
      )}

      {orders.length > 0 && (
        <div className="orders-list fade-in-slow">
          {orders.map((order) => (
            <div key={order._id} className="order-card ui-elevated ui-hover-lift">
              
              <div className="order-header">
                <div className="order-header-info">
                  <h3 className="order-title">Token #{order.tokenNumber}</h3>
                  <p className="order-shop">{order.shop?.name || 'Unknown Shop'}</p>
                  <p className="order-address">📍 {order.shop?.address || 'N/A'}</p>
                </div>

                <span className={`status-badge ${getStatusClass(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="order-details">
                <p>
                  <strong>Customer:</strong> {order.customerName || 'N/A'}
                </p>
                <p>
                  <strong>Vehicle:</strong> {order.vehicleNumber || 'N/A'}
                </p>
                <p>
                  <strong>Date:</strong>{' '}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>

                {order.serviceBay && (
                  <p>
                    <strong>Service Bay:</strong> {order.serviceBay}
                  </p>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;
