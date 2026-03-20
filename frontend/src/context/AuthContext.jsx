import { createContext, useState, useEffect, useContext } from 'react';

const API_URL = "https://local-service-marketplace-k06o.onrender.com";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const storedToken = localStorage.getItem('agri_token');

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(storedToken || null);
  const [loading, setLoading] = useState(!!storedToken);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const verifyUser = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.status === 401) {
          localStorage.removeItem('agri_token');
          setToken(null);
          setUser(null);
          setLoading(false);
          return;
        }

        const data = await res.json();

        if (data.success) {
          setUser(data.user);
        } else {
          localStorage.removeItem('agri_token');
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('agri_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem('agri_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      }

      return {
        success: false,
        message: data.message || 'Login failed',
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Server error. Try again.',
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem('agri_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      }

      return {
        success: false,
        message: data.message || 'Registration failed',
      };
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        message: 'Server error. Try again.',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('agri_token');
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