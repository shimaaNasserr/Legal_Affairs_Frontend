import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem("access") || null);

  useEffect(() => {
    if (accessToken) {
      setUser(JSON.parse(localStorage.getItem("user")));
    }
  }, [accessToken]);

  const login = (token, userData) => {
    localStorage.setItem("access", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setAccessToken(token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("user");
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
