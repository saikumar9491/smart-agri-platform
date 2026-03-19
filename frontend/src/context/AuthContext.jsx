import { createContext, useState, useEffect, useRef, useContext } from 'react';

const API_URL = "https://smart-agri-platform.onrender.com";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const storedToken = localStorage.getItem('agri_token');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(storedToken || null);
  const [loading, setLoading] = useState(!!storedToken);
  const initialized = useRef(false);

  // ✅ VERIFY TOKEN
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (!storedToken) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${storedToken}` },
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        clearTimeout(timeoutId);
        if (data.success) {
          setUser(data.user);
        } else {
          localStorage.removeItem('agri_token');
          setToken(null);
        }
      })
      .catch(() => {
        localStorage.removeItem('agri_token');
        setToken(null);
      })
      .finally(() => {
        setLoading(false);
      });

  }, []);

  // ✅ LOGIN
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('agri_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      }

      return { success: false, message: data.message };

    } catch {
      return { success: false, message: 'Network error. Backend not reachable.' };
    }
  };

  // ✅ REGISTER
  const register = async (userData) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('agri_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      }

      return { success: false, message: data.message };

    } catch {
      return { success: false, message: 'Network error. Backend not reachable.' };
    }
  };

  // ✅ LOGOUT
  const logout = () => {
    localStorage.removeItem('agri_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};