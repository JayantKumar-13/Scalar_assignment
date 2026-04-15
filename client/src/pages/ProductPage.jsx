import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiGet } from "../api/client";
import { useShop } from "../context/ShopContext";
import { formatCurrency } from "../utils";

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, addToWishlist, removeFromWishlist, isWishlisted } = useShop();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");
        const data = await apiGet(`/products/${slug}`);

        if (!cancelled) {
          setProduct(data.product);
          setSelectedImage(0);
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

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function handleAddToCart() {
    try {
      await addToCart(product.id, 1);
    } catch (actionError) {
      alert(actionError.message);
    }
  }

  async function handleBuyNow() {
    try {
      await addToCart(product.id, 1);
      navigate("/checkout");
    } catch (actionError) {
      alert(actionError.message);
    }
  }

  async function handleWishlist() {
    try {
      if (isWishlisted(product.id)) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product.id);
      }
    } catch (actionError) {
      alert(actionError.message);
    }
  }

  if (loading) {
    return <section className="shell section-state">Loading product details...</section>;
  }

  if (error || !product) {
    return <section className="shell section-state error">{error || "Product not found"}</section>;
  }

  const activeImage = product.images[selectedImage] || product.images[0];

  return (
    <section className="shell detail-page">
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>{product.category.name}</span>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <div className="detail-grid">
        <div className="gallery-card">
          <div className="gallery-main">
            <img src={activeImage?.url || product.thumbnailUrl} alt={activeImage?.alt || product.name} />
          </div>
          <div className="gallery-thumbs">
            {product.images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                className={selectedImage === index ? "thumb active" : "thumb"}
                onClick={() => setSelectedImage(index)}
              >
                <img src={image.url} alt={image.alt} />
              </button>
            ))}
          </div>
        </div>

        <div className="detail-copy">
          <span className="product-brand">{product.brand}</span>
          <h1>{product.name}</h1>
          <p className="detail-short">{product.shortDescription}</p>
          <div className="rating-chip large">
            <span>{product.rating}</span>
            <small>{product.reviewCount} ratings</small>
          </div>
          <div className="price-stack">
            <strong>{formatCurrency(product.price)}</strong>
            <span>{formatCurrency(product.originalPrice)}</span>
            <em>{product.discountPercentage}% off</em>
          </div>
          <p className={product.stock > 0 ? "stock-pill in" : "stock-pill out"}>
            {product.stock > 0 ? `${product.stock} items in stock` : "Out of stock"}
          </p>
          <p>{product.description}</p>

          <div className="detail-actions">
            <button className="primary-button" type="button" onClick={handleAddToCart}>
              Add to Cart
            </button>
            <button className="accent-button" type="button" onClick={handleBuyNow}>
              Buy Now
            </button>
            <button className="secondary-button" type="button" onClick={handleWishlist}>
              {isWishlisted(product.id) ? "Saved to Wishlist" : "Add to Wishlist"}
            </button>
          </div>

          <div className="detail-block">
            <h3>Highlights</h3>
            <ul className="detail-list">
              {product.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="spec-card">
        <h2>Specifications</h2>
        <div className="spec-grid">
          {Object.entries(product.specifications).map(([label, value]) => (
            <div key={label} className="spec-row">
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

