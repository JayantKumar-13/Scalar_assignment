import { useDeferredValue, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiGet } from "../api/client";
import CategoryRail from "../components/CategoryRail";
import ProductCard from "../components/ProductCard";
import { useShop } from "../context/ShopContext";

export default function HomePage() {
  const { categories } = useShop();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "relevance";
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");
        const params = new URLSearchParams();

        if (deferredQuery.trim()) {
          params.set("search", deferredQuery.trim());
        }

        if (category) {
          params.set("category", category);
        }

        params.set("sort", sort);

        const data = await apiGet(`/products?${params.toString()}`);

        if (!cancelled) {
          setProducts(data.products || []);
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

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [deferredQuery, category, sort]);

  function updateParam(key, value) {
    const nextParams = new URLSearchParams(searchParams);

    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }

    setSearchParams(nextParams);
  }

  return (
    <>
      {/* <section className="hero">
        <div className="shell hero__content">
          <div className="hero-copy">
            <span className="eyebrow">Scalable Full-Stack Commerce Build</span>
            <h1>Flipkart-style shopping flows with production-minded structure.</h1>
            <p>
              Browse seeded products, filter by category, inspect product details, manage cart
              and wishlist, and complete checkout with order history and optional email support.
            </p>
            <div className="hero-badges">
              <span>React + Vite</span>
              <span>Express API</span>
              <span>MySQL schema + seed</span>
            </div>
          </div>
          <div className="hero-panel">
            <div className="hero-panel__card">
              <strong>Core features</strong>
              <p>Listing, detail page, cart, checkout, confirmation</p>
            </div>
            <div className="hero-panel__card">
              <strong>Bonus coverage</strong>
              <p>Responsive layout, auth, wishlist, order history, email hook</p>
            </div>
          </div>
        </div>
      </section> */}

      <CategoryRail categories={categories} activeCategory={category} onSelect={(value) => updateParam("category", value)} />

      <section className="shell product-section">
        <div className="section-toolbar">
          <div>
            <h2>Recommended for you</h2>
            <p>
              {deferredQuery
                ? `Showing results for "${deferredQuery}"`
                : "A curated selection of catalog items seeded from the assignment data set."}
            </p>
          </div>
          <label className="sort-control">
            Sort by
            <select value={sort} onChange={(event) => updateParam("sort", event.target.value)}>
              <option value="relevance">Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest</option>
            </select>
          </label>
        </div>

        {loading ? <div className="section-state">Loading products...</div> : null}
        {error ? <div className="section-state error">{error}</div> : null}
        {!loading && !error && !products.length ? (
          <div className="section-state">No products matched your search or category filter.</div>
        ) : null}

        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}

