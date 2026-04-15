import { Link } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { formatCurrency } from "../utils";

export default function WishlistPage() {
  const { wishlist, addToCart, removeFromWishlist } = useShop();

  async function moveToCart(productId) {
    try {
      await addToCart(productId, 1);
      await removeFromWishlist(productId);
    } catch (error) {
      alert(error.message);
    }
  }

  if (!wishlist.items.length) {
    return (
      <section className="shell empty-card">
        <h1>Your wishlist is empty</h1>
        <p>Save products here and move them to cart when you are ready to buy.</p>
        <Link className="primary-button inline" to="/">
          Explore Products
        </Link>
      </section>
    );
  }

  return (
    <section className="shell panel">
      <div className="panel-header">
        <h1>Wishlist</h1>
        <p>Products you have saved for later.</p>
      </div>

      <div className="wishlist-grid">
        {wishlist.items.map((item) => (
          <article key={item.productId} className="wishlist-card">
            <img src={item.thumbnailUrl} alt={item.name} />
            <div>
              <Link to={`/products/${item.slug}`}>{item.name}</Link>
              <p>{item.brand}</p>
              <strong>{formatCurrency(item.price)}</strong>
            </div>
            <div className="button-stack">
              <button className="primary-button inline" type="button" onClick={() => moveToCart(item.productId)}>
                Move to Cart
              </button>
              <button className="link-button" type="button" onClick={() => removeFromWishlist(item.productId)}>
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

