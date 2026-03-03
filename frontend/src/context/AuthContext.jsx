// frontend/src/context/AuthContext.jsx
import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

export const AuthContext = createContext();

const API_BASE = import.meta.env.VITE_API_URL || 'https://river-water-management-and-life-safety.onrender.com';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // will store {name, email, role, token}

  // Function to refresh the access token
  const refreshAccessToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        return false;
      }

      const response = await axios.post(`${API_BASE}/api/users/refresh`, {
        token: refreshToken
      });

      if (response.data.success) {
        const newToken = response.data.accessToken;
        localStorage.setItem("token", newToken);
        
        // Update user object with new token
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          userData.token = newToken;
          localStorage.setItem("user", JSON.stringify(userData));
          setUser(userData);
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  }, []);

  // Auto-refresh token every 10 minutes (before 15min expiry)
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Set up token refresh interval (10 minutes)
    const refreshInterval = setInterval(() => {
      const token = localStorage.getItem("token");
      if (token) {
        refreshAccessToken();
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(refreshInterval);
  }, [refreshAccessToken]);

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userData.token);
    if (userData.refreshToken) {
      localStorage.setItem("refreshToken", userData.refreshToken);
    }
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};
