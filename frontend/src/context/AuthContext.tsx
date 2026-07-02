import React, { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import api from '../config/api';

export const UserRole = {
  STUDENT: 'student',
  EMPLOYER: 'employer',
  RECRUITER: 'recruiter',
  PLACEMENT_OFFICER: 'placement_officer',
  COLLEGE_ADMIN: 'college_admin',
  SUPER_ADMIN: 'super_admin'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAuth = async () => {
    setLoading(true);
    const token = localStorage.getItem('accessToken');
    try {
      if (token) {
        const response = await api.get('/auth/me');
        setUser(response.data.data.user);
      } else {
        // Attempt a refresh in case access token was cleared but cookie exists
        const refreshResponse = await api.post('/auth/refresh');
        const { accessToken } = refreshResponse.data.data;
        localStorage.setItem('accessToken', accessToken);
        
        const meResponse = await api.get('/auth/me');
        setUser(meResponse.data.data.user);
      }
    } catch {
      localStorage.removeItem('accessToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, user: loggedUser } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      setUser(loggedUser);
    } catch (error: any) {
      setUser(null);
      localStorage.removeItem('accessToken');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setLoading(true);
    try {
      await api.post('/auth/register', { name, email, password, role });
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore failures on logout API calls
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    const handleExternalLogout = () => {
      localStorage.removeItem('accessToken');
      setUser(null);
    };

    window.addEventListener('auth-logout', handleExternalLogout);
    return () => {
      window.removeEventListener('auth-logout', handleExternalLogout);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
