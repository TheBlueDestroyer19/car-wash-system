import React, { useState } from 'react';
import './TokenForm.css';

function TokenForm({ shop, token, onSuccess, onBack }) {
  const [customerName, setCustomerName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');

    try {
      const authToken = localStorage.getItem('authToken');
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch('/api/tokens', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          customerName,
          vehicleNumber,
          shopId: shop._id
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create token');
      }

      const newToken = await res.json();
      setCustomerName('');
      setVehicleNumber('');
      onSuccess(newToken);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not create token');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="token-form-container ui-page fade-in">
      <div className="token-form-card ui-elevated ui-scale-in">
        
        {/* HEADER */}
        <div className="token-form-header">
          <h2 className="token-title">
            Get Token for {shop.name}
          </h2>

          <button
            onClick={onBack}
            className="back-button ui-hover-scale"
          >
            ← Back to Centers
          </button>
        </div>

        {/* SHOP INFO */}
        <p className="shop-info subtle-text">
          📍 {shop.address}
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="token-form ui-section">
          
          <div className="form-group">
            <label>Customer Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Vehicle Number Plate</label>
            <input
              type="text"
              placeholder="Enter vehicle number"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="error-message fade-in-slight">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={creating}
            className="submit-button ui-hover-lift"
          >
            {creating ? 'Creating Token...' : 'Get Token'}
          </button>
        </form>

      </div>
    </div>
  );
}

export default TokenForm;
