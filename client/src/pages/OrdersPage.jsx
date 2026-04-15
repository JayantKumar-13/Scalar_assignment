import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, formatDate } from "../utils";

export default function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      try {
        setLoading(true);
        const response = await apiGet("/orders", token);

        if (!cancelled) {
          setOrders(response.orders || []);
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

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <section className="shell panel">
      <div className="panel-header">
        <h1>Order History</h1>
        <p>Review all previously placed orders and their current status.</p>
      </div>

      {loading ? <div className="section-state">Loading orders...</div> : null}
      {error ? <div className="section-state error">{error}</div> : null}
      {!loading && !error && !orders.length ? (
        <div className="section-state">No orders placed yet.</div>
      ) : null}

      <div className="orders-list">
        {orders.map((order) => (
          <article key={order.id} className="order-card">
            <div>
              <span className="eyebrow">Order ID</span>
              <h3>{order.orderNumber}</h3>
              <p>{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <span>Status</span>
              <strong>{order.status}</strong>
            </div>
            <div>
              <span>Total</span>
              <strong>{formatCurrency(order.total)}</strong>
            </div>
            <div className="order-card__actions">
              <Link className="secondary-button inline" to={`/orders/${order.orderNumber}/success`}>
                View Details
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

