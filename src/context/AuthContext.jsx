import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { AuthContext } from './authContextValue.js';
import api from '../services/api';
import { rolePermissions } from '../utils/constants.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('bugsphere_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('bugsphere_token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        console.log('👤 Loading authenticated user...');

        const { data } = await api.get('/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('✅ User Loaded');
        console.log(data);

        setUser(data);
        localStorage.setItem('bugsphere_user', JSON.stringify(data));
      } catch (error) {
        console.error('❌ Failed to load user');
        console.error(error);

        localStorage.removeItem('bugsphere_token');
        localStorage.removeItem('bugsphere_user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (credentials) => {
    console.log('================================');
    console.log('🚀 LOGIN STARTED');
    console.log(credentials);

    try {
      const { data } = await api.post('/auth/login', credentials);

      console.log('✅ Login Response');
      console.log(data);

      localStorage.setItem('bugsphere_token', data.token);
      localStorage.setItem(
        'bugsphere_user',
        JSON.stringify(data.user)
      );

      setUser(data.user);

      toast.success('Welcome back to BugSphere');

      return data.user;
    } catch (error) {
      console.error('❌ Login Failed');
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          'Login failed'
      );

      throw error;
    }
  };

  const register = async (payload) => {
    console.log('================================');
    console.log('🚀 REGISTER STARTED');
    console.log(payload);

    try {
      const { data } = await api.post(
        '/auth/register',
        payload
      );

      console.log('✅ Registration Response');
      console.log(data);

      localStorage.setItem(
        'bugsphere_token',
        data.token
      );

      localStorage.setItem(
        'bugsphere_user',
        JSON.stringify(data.user)
      );

      setUser(data.user);

      toast.success('Workspace created');

      return data.user;
    } catch (error) {
      console.error('❌ Registration Failed');
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          'Registration failed'
      );

      throw error;
    }
  };

  const logout = async () => {
    console.log('================================');
    console.log('🚪 LOGOUT');

    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error(error);
    }

    localStorage.removeItem('bugsphere_token');
    localStorage.removeItem('bugsphere_user');

    setUser(null);

    toast.success('Signed out');
  };

  const can = (permission) => {
    return Boolean(
      user &&
      rolePermissions[user.role]?.includes(permission)
    );
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      can,
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}