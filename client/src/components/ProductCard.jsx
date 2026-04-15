import { Link } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { formatCurrency } from "../utils";

export default function ProductCard({ product }) {
  const { addToCart, addToWishlist, removeFromWishlist, isWishlisted } = useShop();
  const saved = isWishlisted(product.id);

  async function handleCart() {
    try {
      await addToCart(product.id, 1);
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleWishlist() {
    try {
      if (saved) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product.id);
      }
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <article className="product-card">
      <button className={saved ? "wishlist-toggle active" : "wishlist-toggle"} type="button" onClick={handleWishlist}>
        Save
      </button>
      <Link className="product-card__media" to={`/products/${product.slug}`}>
        <img src={product.thumbnailUrl} alt={product.name} />
      </Link>
      <div className="product-card__body">
        <span className="product-brand">{product.brand}</span>
        <Link className="product-title" to={`/products/${product.slug}`}>
          {product.name}
        </Link>
        <p className="product-copy">{product.shortDescription}</p>
        <div className="rating-chip">
          <span>{product.rating}</span>
          <small>{product.reviewCount} ratings</small>
        </div>
        <div className="price-row">
          <strong>{formatCurrency(product.price)}</strong>
          <span>{formatCurrency(product.originalPrice)}</span>
          <em>{product.discountPercentage}% off</em>
        </div>
        <button className="primary-button" type="button" onClick={handleCart}>
          Add to Cart
        </button>
      </div>
    </article>
  );
}
