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
      <h2 className="page-title">Choose Your Car Wash Center</h2>

      {shops.length === 0 ? (
        <p>No car wash centers available at the moment.</p>
      ) : (
        <div className="lux-card-grid">
          {shops.map((shop) => (
            <div
              key={shop._id}
              className="lux-vertical-card"
              onClick={() => onSelectShop(shop)}
            >
              <h3 className="lux-card-title">{shop.name}</h3>

              <span className="lux-waiting">{shop.waitingCount} waiting</span>

              <p className="lux-address">📍 {shop.address}</p>

              <button className="lux-select-btn">
                Select Center
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ShopDashboard;
