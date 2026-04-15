import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { user, isAuthenticated, login, register, demoLogin, logout } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: ""
  });
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);

      if (mode === "login") {
        await login({ email: form.email, password: form.password });
      } else {
        await register(form);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (isAuthenticated && user) {
    return (
      <section className="shell auth-layout">
        <div className="auth-info">
          <span className="eyebrow">Signed In</span>
          <h1>{user.fullName}</h1>
          <p>{user.email}</p>
          <div className="button-row">
            <Link className="primary-button inline" to="/">
              Continue Shopping
            </Link>
            <button className="secondary-button inline" type="button" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="shell auth-layout">
      <div className="auth-info">
        <span className="eyebrow">Bonus Feature</span>
        <h1>Login and signup flow</h1>
        <p>
          The app also supports demo auto-login for evaluator convenience. You can switch to your
          own account here anytime.
        </p>
        <button className="secondary-button inline" type="button" onClick={demoLogin}>
          Use Demo Login
        </button>
      </div>

      <form className="panel auth-form" onSubmit={handleSubmit}>
        <div className="tabs">
          <button type="button" className={mode === "login" ? "tab active" : "tab"} onClick={() => setMode("login")}>
            Login
          </button>
          <button type="button" className={mode === "signup" ? "tab active" : "tab"} onClick={() => setMode("signup")}>
            Sign Up
          </button>
        </div>

        {mode === "signup" ? (
          <label>
            Full Name
            <input name="fullName" value={form.fullName} onChange={handleChange} required />
          </label>
        ) : null}

        <label>
          Email Address
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>

        {mode === "signup" ? (
          <label>
            Phone Number
            <input name="phone" value={form.phone} onChange={handleChange} />
          </label>
        ) : null}

        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
        </label>

        <button className="accent-button full" type="submit" disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
        </button>
      </form>
    </section>
  );
}

