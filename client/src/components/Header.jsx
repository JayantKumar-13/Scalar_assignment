import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isDemoUser } = useAuth();
  const { cart, wishlist } = useShop();
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchValue(params.get("q") || "");
  }, [location.search]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    const params = new URLSearchParams();

    if (searchValue.trim()) {
      params.set("q", searchValue.trim());
    }

    navigate(`/?${params.toString()}`);
  }

  return (
    <header className="site-header">
      <div className="mini-strip">
       
      </div>
      <div className="main-nav">
        <div className="shell main-nav__content">
          <Link className="brand" to="/">
            <span className="brand__title">shopiMart</span>
            
          </Link>

          <form className="header-search" onSubmit={handleSearchSubmit}>
            <input
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search for products, brands and more"
            />
            <button type="submit">Search</button>
          </form>

          <nav className="header-links">
            <NavLink to="/wishlist">Wishlist {wishlist.items.length ? `(${wishlist.items.length})` : ""}</NavLink>
            <NavLink to="/orders">Orders</NavLink>
            <NavLink to="/cart">Cart {cart.summary.itemCount ? `(${cart.summary.itemCount})` : ""}</NavLink>
            <NavLink to="/login">{user ? user.fullName.split(" ")[0] : "Login"}</NavLink>
            {user ? (
              <button className="ghost-button" type="button" onClick={logout}>
                Logout
              </button>
            ) : null}
          </nav>
        </div>
      </div>
    </header>
  );
}

