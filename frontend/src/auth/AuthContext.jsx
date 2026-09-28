import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { userFromToken } from "./jwt";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  // Keep state in sync if the token is changed/cleared in another tab.
  useEffect(() => {
    function handleStorage(event) {
      if (event.key === "token") setToken(event.newValue);
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const user = useMemo(() => userFromToken(token), [token]);

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
