import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const storedToken = localStorage.getItem("access");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setAccessToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
 
    setLoading(false);   
  }, []);

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
    <AuthContext.Provider value={{ user, accessToken, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
