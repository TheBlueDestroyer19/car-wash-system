import React from "react";
import "./TokenForm.css";

class TokenForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      customerName: "",
      vehicleNumber: "",
      creating: false,
      error: ""
    };
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ creating: true, error: "" });

    const { shop, onSuccess } = this.props;

    try {
      const authToken = localStorage.getItem("authToken");
      const headers = { "Content-Type": "application/json" };

      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      const res = await fetch("/api/tokens", {
        method: "POST",
        headers,
        body: JSON.stringify({
          customerName: this.state.customerName,
          vehicleNumber: this.state.vehicleNumber,
          shopId: shop._id
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create token");
      }

      const newToken = await res.json();

      this.setState({
        customerName: "",
        vehicleNumber: ""
      });

      onSuccess(newToken);
    } catch (err) {
      console.error(err);
      this.setState({
        error: err.message || "Could not create token"
      });
    } finally {
      this.setState({ creating: false });
    }
  };

  handleInput = (field, value) => {
    this.setState({ [field]: value });
  };

  render() {
    const { shop, onBack } = this.props;
    const { customerName, vehicleNumber, creating, error } = this.state;

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
          <form onSubmit={this.handleSubmit} className="token-form ui-section">
            
            <div className="form-group">
              <label>Customer Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={customerName}
                onChange={(e) => this.handleInput("customerName", e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Vehicle Number Plate</label>
              <input
                type="text"
                placeholder="Enter vehicle number"
                value={vehicleNumber}
                onChange={(e) => this.handleInput("vehicleNumber", e.target.value)}
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
              {creating ? "Creating Token..." : "Get Token"}
            </button>
          </form>

        </div>
      </div>
    );
  }
}

export default TokenForm;
