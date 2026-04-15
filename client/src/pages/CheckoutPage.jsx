import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";
import { formatCurrency } from "../utils";

const initialAddress = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India"
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { cart, refreshCart } = useShop();
  const [address, setAddress] = useState(initialAddress);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setAddress((current) => ({
        ...current,
        fullName: current.fullName || user.fullName,
        phone: current.phone || user.phone || ""
      }));
    }
  }, [user]);

  function handleChange(event) {
    const { name, value } = event.target;
    setAddress((current) => ({ ...current, [name]: value }));
  }

  async function handlePlaceOrder(event) {
    event.preventDefault();

    try {
      setLoading(true);
      const response = await apiPost(
        "/orders",
        {
          shippingAddress: address,
          paymentMethod: "Cash on Delivery"
        },
        token
      );

      await refreshCart();
      navigate(`/orders/${response.order.orderNumber}/success`);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (!cart.items.length) {
    return (
      <section className="shell empty-card">
        <h1>No items available for checkout</h1>
        <p>Your cart needs at least one product before you can place an order.</p>
        <Link className="primary-button inline" to="/cart">
          Go to Cart
        </Link>
      </section>
    );
  }

  return (
    <section className="shell checkout-layout">
      <form className="panel form-panel" onSubmit={handlePlaceOrder}>
        <div className="panel-header">
          <h1>Checkout</h1>
          <p>Review your shipping details before placing the order.</p>
        </div>

        <div className="form-grid">
          <label>
            Full Name
            <input name="fullName" value={address.fullName} onChange={handleChange} required />
          </label>
          <label>
            Phone Number
            <input name="phone" value={address.phone} onChange={handleChange} required />
          </label>
          <label className="span-two">
            Address Line 1
            <input name="addressLine1" value={address.addressLine1} onChange={handleChange} required />
          </label>
          <label className="span-two">
            Address Line 2
            <input name="addressLine2" value={address.addressLine2} onChange={handleChange} />
          </label>
          <label>
            City
            <input name="city" value={address.city} onChange={handleChange} required />
          </label>
          <label>
            State
            <input name="state" value={address.state} onChange={handleChange} required />
          </label>
          <label>
            Postal Code
            <input name="postalCode" value={address.postalCode} onChange={handleChange} required />
          </label>
          <label>
            Country
            <input name="country" value={address.country} onChange={handleChange} required />
          </label>
        </div>

        <div className="checkout-note">
          Payment method: <strong>Cash on Delivery</strong>
        </div>

        <button className="accent-button full" type="submit" disabled={loading}>
          {loading ? "Placing order..." : "Confirm Order"}
        </button>
      </form>

      <aside className="summary-card">
        <h2>Order Summary</h2>
        {cart.items.map((item) => (
          <div key={item.productId} className="summary-line-item">
            <span>
              {item.name} x {item.quantity}
            </span>
            <strong>{formatCurrency(item.lineTotal)}</strong>
          </div>
        ))}
        <div className="summary-row total">
          <span>Total</span>
          <strong>{formatCurrency(cart.summary.total)}</strong>
        </div>
      </aside>
    </section>
  );
}

