import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('agri_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('agri_token', token);
      fetchMe(token);
    } else {
      localStorage.removeItem('agri_token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchMe = async (activeToken) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      } else {
        setToken(null);
      }
    } catch (err) {
      console.error('Auth error', err);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    }
    return { success: false, message: data.message };
  };

  const register = async (userData) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    }
    return { success: false, message: data.message };
  };

  const logout = () => {
    setToken(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
