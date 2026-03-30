import { createContext, useState, useEffect, useContext } from 'react';

import { API_URL } from '../config';

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

  // 🔥 PRE-WARM RENDER INSTANCE (CENTRALIZED)
  useEffect(() => {
    fetch(`${API_URL}/api/health`)
      .then(() => console.log('🚀 Backend wake-up ping sent from AuthContext'))
      .catch((err) => console.error('Wake-up ping failed:', err));
  }, []);

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

  const googleLogin = async (credential) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential }),
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
        message: data.message || 'Google login failed',
      };
    } catch (error) {
      console.error('Google login error:', error);
      return {
        success: false,
        message: 'Server error. Try again.',
      };
    }
  };

  // Sync "following" state globally
  const updateFollowing = (userId, isFollowing) => {
    setUser(prev => {
      if (!prev) return prev;
      const currentFollowing = prev.following || [];
      return {
        ...prev,
        following: isFollowing
          ? [...currentFollowing, userId]
          : currentFollowing.filter(id => id !== userId)
      };
    });
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
        googleLogin,
        setUser,
        updateFollowing,
      }}

    >
      {children}
    </AuthContext.Provider>
  );
};