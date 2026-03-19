import { createContext, useState, useEffect, useContext } from 'react';

const API_URL = "https://smart-agri-platform.onrender.com";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('agri_token'));
  const [loading, setLoading] = useState(true);

  // ✅ VERIFY TOKEN (runs whenever token changes)
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const verifyUser = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        // ❌ Token invalid → logout
        if (res.status === 401) {
          localStorage.removeItem("agri_token");
          setToken(null);
          setUser(null);
          setLoading(false);
          return;
        }

        const data = await res.json();

        if (data.success) {
          setUser(data.user);
        } else {
          throw new Error("Invalid token");
        }

      } catch (error) {
        console.error("Auth error:", error);
        localStorage.removeItem("agri_token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();

  }, [token]);

  // ✅ LOGIN
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem("agri_token", data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      }

      return { success: false, message: data.message };

    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Server error. Try again." };
    }
  };

  // ✅ REGISTER
  const register = async (userData) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem("agri_token", data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      }

      return { success: false, message: data.message };

    } catch (error) {
      console.error("Register error:", error);
      return { success: false, message: "Server error. Try again." };
    }
  };

  // ✅ LOGOUT
  const logout = () => {
    localStorage.removeItem("agri_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};