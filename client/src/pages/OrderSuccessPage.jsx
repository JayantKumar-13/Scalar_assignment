import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGet } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, formatDate } from "../utils";

export default function OrderSuccessPage() {
  const { orderNumber } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadOrder() {
      try {
        setLoading(true);
        const response = await apiGet(`/orders/${orderNumber}`, token);

        if (!cancelled) {
          setOrder(response.order);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [orderNumber, token]);

  if (loading) {
    return <section className="shell section-state">Loading confirmation...</section>;
  }

  if (error || !order) {
    return <section className="shell section-state error">{error || "Order not found"}</section>;
  }

  return (
    <section className="shell confirmation-card">
      <div className="confirmation-banner">
        <span className="eyebrow">Order Confirmed</span>
        <h1>Your order has been placed successfully.</h1>
        <p>
          Order ID <strong>{order.orderNumber}</strong> placed on {formatDate(order.createdAt)}.
        </p>
      </div>

      <div className="confirmation-grid">
        <div className="panel">
          <h2>Delivery Address</h2>
          <p>{order.shippingAddress.fullName}</p>
          <p>{order.shippingAddress.phone}</p>
          <p>{order.shippingAddress.addressLine1}</p>
          {order.shippingAddress.addressLine2 ? <p>{order.shippingAddress.addressLine2}</p> : null}
          <p>
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
          </p>
          <p>{order.shippingAddress.country}</p>
        </div>

        <div className="summary-card">
          <h2>Payment Summary</h2>
          <div className="summary-row">
            <span>Status</span>
            <strong>{order.status}</strong>
          </div>
          <div className="summary-row">
            <span>Payment Method</span>
            <strong>{order.paymentMethod}</strong>
          </div>
          <div className="summary-row total">
            <span>Total Paid</span>
            <strong>{formatCurrency(order.total)}</strong>
          </div>
        </div>
      </div>

      <div className="panel">
        <h2>Items</h2>
        {order.items.map((item) => (
          <div key={item.id} className="summary-line-item detailed">
            <span>
              {item.productName} x {item.quantity}
            </span>
            <strong>{formatCurrency(item.lineTotal)}</strong>
          </div>
        ))}
      </div>

      <div className="button-row">
        <Link className="primary-button inline" to="/orders">
          View Order History
        </Link>
        <Link className="secondary-button inline" to="/">
          Continue Shopping
        </Link>
      </div>
    </section>
  );
}

