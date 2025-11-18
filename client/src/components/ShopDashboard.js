import React, { useEffect, useState } from 'react';
import './ShopDashboard.css';

function ShopDashboard({ onSelectShop }) {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/shops');
      if (!res.ok) throw new Error('Failed to fetch shops');
      const data = await res.json();
      setShops(data);
      setError('');
    } catch (err) {
      console.error('Error fetching shops:', err);
      setError('Failed to load car wash centers');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="shop-dashboard"><p>Loading car wash centers...</p></div>;
  }

  if (error) {
    return <div className="shop-dashboard"><p className="error">{error}</p></div>;
  }

  return (
    <div className="shop-dashboard">
      <h2>Select a Car Wash Center</h2>
      {shops.length === 0 ? (
        <p>No car wash centers available at the moment.</p>
      ) : (
        <div className="shops-grid">
          {shops.map((shop) => (
            <div key={shop._id} className="shop-card" onClick={() => onSelectShop(shop)}>
              <div className="shop-card-header">
                <h3>{shop.name}</h3>
                <span className="waiting-badge">{shop.waitingCount} waiting</span>
              </div>
              <div className="shop-card-body">
                <p className="shop-address">📍 {shop.address}</p>
              </div>
              <div className="shop-card-footer">
                <button className="select-shop-button">Select This Center</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ShopDashboard;

