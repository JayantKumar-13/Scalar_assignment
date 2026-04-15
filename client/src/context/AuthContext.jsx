import { createContext, useContext, useEffect, useState } from "react";
import { apiGet, apiPost } from "../api/client";

const TOKEN_KEY = "flipkart_clone_token";
const USER_KEY = "flipkart_clone_user";
const MANUAL_LOGOUT_KEY = "flipkart_clone_manual_logout";

const AuthContext = createContext(null);

function persistSession(payload) {
  localStorage.setItem(TOKEN_KEY, payload.token);
  localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
  localStorage.removeItem(MANUAL_LOGOUT_KEY);
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [ready, setReady] = useState(false);

  async function completeLogin(payload) {
    persistSession(payload);
    setToken(payload.token);
    setUser(payload.user);
  }

  async function handleDemoLogin() {
    const payload = await apiPost("/auth/demo-login", {});
    await completeLogin(payload);
    return payload;
  }

  useEffect(() => {
    let isMounted = true;

    async function hydrateSession() {
      try {
        const savedToken = localStorage.getItem(TOKEN_KEY);
        const manualLogout = localStorage.getItem(MANUAL_LOGOUT_KEY);

        if (savedToken) {
          const response = await apiGet("/auth/me", savedToken);

          if (!isMounted) {
            return;
          }

          setToken(savedToken);
          setUser(response.user);
          localStorage.setItem(USER_KEY, JSON.stringify(response.user));
          setReady(true);
          return;
        }

        if (!manualLogout) {
          await handleDemoLogin();
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken("");
        setUser(null);

        if (!localStorage.getItem(MANUAL_LOGOUT_KEY)) {
          try {
            await handleDemoLogin();
          } catch (demoError) {
            console.error(demoError);
          }
        }
      } finally {
        if (isMounted) {
          setReady(true);
        }
      }
    }

    hydrateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  async function login(credentials) {
    const payload = await apiPost("/auth/login", credentials);
    await completeLogin(payload);
    return payload;
  }

  async function register(values) {
    const payload = await apiPost("/auth/register", values);
    await completeLogin(payload);
    return payload;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.setItem(MANUAL_LOGOUT_KEY, "true");
    setToken("");
    setUser(null);
  }

  const value = {
    token,
    user,
    ready,
    isAuthenticated: Boolean(token && user),
    isDemoUser: user?.email === "demo@flipkartclone.dev",
    login,
    register,
    demoLogin: handleDemoLogin,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
