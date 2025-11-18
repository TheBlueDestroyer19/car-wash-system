import React from "react";
import "./ShopDashboard.css";

class ShopDashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      shops: [],
      loading: true,
      error: ""
    };
  }

  componentDidMount() {
    this.fetchShops();
  }

  fetchShops = async () => {
    try {
      this.setState({ loading: true });

      const res = await fetch("/api/shops");
      if (!res.ok) throw new Error("Failed to fetch shops");

      const data = await res.json();

      this.setState({
        shops: data,
        error: ""
      });
    } catch (err) {
      console.error("Error fetching shops:", err);
      this.setState({
        error: "Failed to load car wash centers"
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { onSelectShop } = this.props;
    const { shops, loading, error } = this.state;

    if (loading) {
      return (
        <div className="shop-dashboard">
          <p>Loading car wash centers...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="shop-dashboard">
          <p className="error">{error}</p>
        </div>
      );
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

                <div className="lux-badges">
                  <span className="lux-waiting">{shop.waitingCount} waiting</span>
                  <span className="lux-active-token">
                    {shop.currentInServiceToken
                      ? `Now serving #${shop.currentInServiceToken}`
                      : 'Bay ready for next token'}
                  </span>
                </div>

                <p className="lux-address">📍 {shop.address}</p>

                <button className="lux-select-btn">Select Center</button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

export default ShopDashboard;
