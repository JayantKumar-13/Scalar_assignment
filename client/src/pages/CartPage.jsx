import { Link, useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { formatCurrency } from "../utils";

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, updateCartQuantity, removeFromCart } = useShop();

  async function changeQuantity(productId, nextQuantity) {
    try {
      await updateCartQuantity(productId, nextQuantity);
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleRemove(productId) {
    try {
      await removeFromCart(productId);
    } catch (error) {
      alert(error.message);
    }
  }

  if (!cart.items.length) {
    return (
      <section className="shell empty-card">
        <h1>Your cart is empty</h1>
        <p>Add a few products to review price summary, shipping, and checkout flow.</p>
        <Link className="primary-button inline" to="/">
          Continue Shopping
        </Link>
      </section>
    );
  }

  return (
    <section className="shell cart-layout">
      <div className="panel">
        <div className="panel-header">
          <h1>Shopping Cart</h1>
          <p>{cart.summary.itemCount} items selected</p>
        </div>

        {cart.items.map((item) => (
          <article key={item.productId} className="cart-item">
            <img src={item.thumbnailUrl} alt={item.name} />
            <div className="cart-item__body">
              <Link to={`/products/${item.slug}`}>{item.name}</Link>
              <span>{item.brand}</span>
              <strong>{formatCurrency(item.price)}</strong>
              <div className="quantity-row">
                <button type="button" onClick={() => changeQuantity(item.productId, Math.max(1, item.quantity - 1))}>
                  -
                </button>
                <span>{item.quantity}</span>
                <button type="button" onClick={() => changeQuantity(item.productId, item.quantity + 1)}>
                  +
                </button>
              </div>
            </div>
            <div className="cart-item__meta">
              <strong>{formatCurrency(item.lineTotal)}</strong>
              <button className="link-button" type="button" onClick={() => handleRemove(item.productId)}>
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>

      <aside className="summary-card">
        <h2>Price details</h2>
        <div className="summary-row">
          <span>Subtotal</span>
          <strong>{formatCurrency(cart.summary.subtotal)}</strong>
        </div>
        <div className="summary-row">
          <span>Discount</span>
          <strong className="text-success">-{formatCurrency(cart.summary.discount)}</strong>
        </div>
        <div className="summary-row">
          <span>Delivery Charges</span>
          <strong>Free</strong>
        </div>
        <div className="summary-row total">
          <span>Total Amount</span>
          <strong>{formatCurrency(cart.summary.total)}</strong>
        </div>
        <button className="accent-button full" type="button" onClick={() => navigate("/checkout")}>
          Place Order
        </button>
      </aside>
    </section>
  );
}
