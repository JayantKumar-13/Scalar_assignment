import { createContext, useContext, useEffect, useState } from "react";
import { apiDelete, apiGet, apiPatch, apiPost } from "../api/client";
import { useAuth } from "./AuthContext";

const defaultCart = {
  items: [],
  summary: {
    itemCount: 0,
    subtotal: 0,
    discount: 0,
    shippingFee: 0,
    total: 0
  }
};

const ShopContext = createContext(null);

export function ShopProvider({ children }) {
  const { token, ready } = useAuth();
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState(defaultCart);
  const [wishlist, setWishlist] = useState({ items: [] });

  useEffect(() => {
    let cancelled = false;

    async function hydrateStore() {
      try {
        const categoryData = await apiGet("/categories");

        if (!cancelled) {
          setCategories(categoryData.categories || []);
        }

        if (!token) {
          if (!cancelled) {
            setCart(defaultCart);
            setWishlist({ items: [] });
          }
          return;
        }

        const [cartData, wishlistData] = await Promise.all([
          apiGet("/cart", token),
          apiGet("/wishlist", token)
        ]);

        if (!cancelled) {
          setCart(cartData);
          setWishlist(wishlistData);
        }
      } catch (error) {
        console.error(error);
      }
    }

    if (ready) {
      hydrateStore();
    }

    return () => {
      cancelled = true;
    };
  }, [ready, token]);

  async function refreshCart() {
    if (!token) {
      return defaultCart;
    }

    const data = await apiGet("/cart", token);
    setCart(data);
    return data;
  }

  async function refreshWishlist() {
    if (!token) {
      return { items: [] };
    }

    const data = await apiGet("/wishlist", token);
    setWishlist(data);
    return data;
  }

  async function addToCart(productId, quantity = 1) {
    const data = await apiPost("/cart/items", { productId, quantity }, token);
    setCart(data);
    return data;
  }

  async function updateCartQuantity(productId, quantity) {
    const data = await apiPatch(`/cart/items/${productId}`, { quantity }, token);
    setCart(data);
    return data;
  }

  async function removeFromCart(productId) {
    const data = await apiDelete(`/cart/items/${productId}`, token);
    setCart(data);
    return data;
  }

  async function addToWishlist(productId) {
    const data = await apiPost("/wishlist/items", { productId }, token);
    setWishlist(data);
    return data;
  }

  async function removeFromWishlist(productId) {
    const data = await apiDelete(`/wishlist/items/${productId}`, token);
    setWishlist(data);
    return data;
  }

  function isWishlisted(productId) {
    return wishlist.items.some((item) => item.productId === productId);
  }

  const value = {
    categories,
    cart,
    wishlist,
    refreshCart,
    refreshWishlist,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    addToWishlist,
    removeFromWishlist,
    isWishlisted
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  return useContext(ShopContext);
}
