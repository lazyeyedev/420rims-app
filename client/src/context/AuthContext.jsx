import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem('420rims_token'));
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restore = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await axiosInstance.get('/auth/me');
        setUser(data.user);
      } catch {
        localStorage.removeItem('420rims_token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, [token]);

  const storeToken = (t) => {
    localStorage.setItem('420rims_token', t);
    setToken(t);
  };

  const login = async (email, password) => {
    const { data } = await axiosInstance.post('/auth/login', { email, password });
    storeToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const registerUser = async (formData) => {
    const { data } = await axiosInstance.post('/auth/register', formData);
    storeToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const registerDealer = async (formData) => {
    const { data } = await axiosInstance.post('/auth/register/dealer', formData);
    storeToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('420rims_token');
    localStorage.removeItem('420rims_user');
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
        registerUser,
        registerDealer,
        logout,
        isDealer: user?.role === 'dealer',
        isAdmin:  user?.role === 'admin',
        isUser:   user?.role === 'user',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
