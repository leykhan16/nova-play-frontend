import { createContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { accessToken, refreshToken, user } = res.data.data;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    await authAPI.logout({ refreshToken }).catch(() => {});
    localStorage.clear();
    setUser(null);
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
