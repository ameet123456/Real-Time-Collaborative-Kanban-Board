import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';

import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(() => {

    try {

      return JSON.parse(
        localStorage.getItem('user') || 'null'
      );

    } catch {

      return null;

    }

  });

  const [token, setToken] = useState(
    localStorage.getItem('token') || null
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const verifyUser = async () => {

      try {

        if (!token) {
          setLoading(false);
          return;
        }

        const { data } = await api.get('/auth/me');

        setUser(data.user);

      } catch (error) {

        localStorage.removeItem('token');

        localStorage.removeItem('user');

        setToken(null);

        setUser(null);

      } finally {

        setLoading(false);

      }

    };

    verifyUser();

  }, [token]);

  const login = useCallback(async (email, password) => {

    const { data } = await api.post('/auth/login', {
      email,
      password
    });

    localStorage.setItem('token', data.token);

    localStorage.setItem(
      'user',
      JSON.stringify(data.user)
    );

    setUser(data.user);

    setToken(data.token);

    return data;

  }, []);

  const register = useCallback(async (name, email, password) => {

    const { data } = await api.post('/auth/register', {
      name,
      email,
      password
    });

    localStorage.setItem('token', data.token);

    localStorage.setItem(
      'user',
      JSON.stringify(data.user)
    );

    setUser(data.user);

    setToken(data.token);

    return data;

  }, []);

  const logout = useCallback(() => {

    localStorage.removeItem('token');

    localStorage.removeItem('user');

    setToken(null);

    setUser(null);

  }, []);

  return (

    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>

  );

};

export const useAuth = () => {

  const ctx = useContext(AuthContext);

  if (!ctx) {

    throw new Error(
      'useAuth must be used within AuthProvider'
    );

  }

  return ctx;

};