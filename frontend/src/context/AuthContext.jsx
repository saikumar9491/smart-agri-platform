import { createContext, useState, useEffect, useRef, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const storedToken = localStorage.getItem('agri_token');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(storedToken || null);
  // Only show loading spinner if there's a token to validate
  const [loading, setLoading] = useState(!!storedToken);
  const initialized = useRef(false);

  // On mount: if a token exists, verify it once with the server
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (!storedToken) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${storedToken}` },
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        clearTimeout(timeoutId);
        if (data.success) {
          setUser(data.user);
        } else {
          // Token is invalid/expired — clear it
          localStorage.removeItem('agri_token');
          setToken(null);
        }
      })
      .catch(() => {
        // Network error or timeout — clear token so user can log in again
        localStorage.removeItem('agri_token');
        setToken(null);
      })
      .finally(() => {
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
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
      return { success: false, message: 'Network error. Is the server running?' };
    }
  };

  const register = async (userData) => {
    try {
      const res = await fetch('/api/auth/register', {
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
      return { success: false, message: 'Network error. Is the server running?' };
    }
  };

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
