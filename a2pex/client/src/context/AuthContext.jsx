import { createContext, useEffect, useState } from 'react';
import { loginAdmin } from '../api/auth';

export const AuthContext = createContext(null);

const TOKEN_KEY = 'a2pex_admin_token';
const ADMIN_KEY = 'a2pex_admin';

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedAdmin = localStorage.getItem(ADMIN_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    if (storedAdmin && token) {
      try {
        setAdmin(JSON.parse(storedAdmin));
      } catch {
        localStorage.removeItem(ADMIN_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username, password) => {
    const { token, admin: adminData } = await loginAdmin(username, password);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ADMIN_KEY, JSON.stringify(adminData));
    setAdmin(adminData);
    return adminData;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
    setAdmin(null);
  };

  const value = { admin, isLoading, isAuthenticated: !!admin, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
