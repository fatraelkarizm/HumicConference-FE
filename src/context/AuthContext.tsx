'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AuthContextType, User, ROLE_ROUTES } from '@/types/auth';
import AuthService from '@/services/AuthService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: User | null;
  initialAccessToken?: string | null;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children, 
  initialUser = null,
  initialAccessToken = null 
}) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(!initialUser);
  const [accessToken, setAccessToken] = useState<string | null>(initialAccessToken);

  // Get dashboard URL based on role
  const getDashboardUrl = useCallback((role: string): string => {
    const url = ROLE_ROUTES[role as keyof typeof ROLE_ROUTES] || '/dashboard';
    return url;
  }, []);

  // Refresh access token
  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const newAccessToken = await AuthService.refreshAccessToken();
      setAccessToken(newAccessToken);
      
      if (newAccessToken && !user) {
        const currentUser = await AuthService.getCurrentUser(newAccessToken);
        if (currentUser) {
          setUser(currentUser);
        }
      } else if (!newAccessToken) {
        setUser(null);
      }
      
      return newAccessToken;
    } catch (error) {
      setAccessToken(null);
      setUser(null);
      return null;
    }
  }, [user]);

  // Login function dengan role-based redirect
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const loginResponse = await AuthService.login({ email, password });
      setUser(loginResponse.user);
      setAccessToken(loginResponse.accessToken);
      
      // Automatic redirect based on role
      const dashboardUrl = getDashboardUrl(loginResponse.user.role);
      
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.location.href = dashboardUrl;
        }, 200);
      }
      
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }, [getDashboardUrl]);

  // Logout function - UPDATED dengan proper cleanup
  const logout = useCallback(async (): Promise<void> => {
    setLoading(true);
    
    try {
      
      // Step 1: Try to call backend logout endpoint (jika ada)
      // Tapi kalau ga ada API, skip aja
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
        } else {
        }
      } catch (apiError) {
      }

      // Step 2: Clear all client-side auth state
      setUser(null);
      setAccessToken(null);

      // Step 3: Clear browser storage (localStorage, sessionStorage)
      if (typeof window !== 'undefined') {
        try {
          // Clear any stored tokens/data
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          localStorage.removeItem('auth_token');
          
          // Clear session storage too
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('refreshToken');
          sessionStorage.removeItem('user');
          
        } catch (storageError) {
        }
      }

      // Step 4: Clear HTTP-only cookies dengan request ke backend
      try {
        await fetch('/api/auth/clear-cookies', {
          method: 'POST',
          credentials: 'include',
        });
      } catch (cookieError) {
      }

      
    } catch (error) {
      // Even if there's an error, still clear client state
      setUser(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
      
      // Step 5: Redirect to login page
      if (typeof window !== 'undefined') {
        
        // Clear the current page from history
        window.history.replaceState(null, '', '/login');
        
        // Force redirect
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }
  }, []);

  // Check refresh token via same endpoint dengan GET method
  const checkRefreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.hasRefreshToken || false;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }, []);

  // Check if current user can access current route
  const canAccessCurrentRoute = useCallback((): boolean => {
    if (typeof window === 'undefined' || !user) return true; // Let middleware handle

    const currentPath = window.location.pathname;

    // Super admin can access everything
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // Admin users can only access their specific admin routes
    if (user.role === 'ADMIN_ICICYTA' && currentPath.startsWith('/admin/ICICyTA')) {
      return true;
    }

    if (user.role === 'ADMIN_ICODSA' && currentPath.startsWith('/admin/ICODSA')) {
      return true;
    }

    // If trying to access wrong admin area, redirect to correct one
    if (currentPath.startsWith('/admin/') || currentPath.startsWith('/super-admin/')) {
      const correctUrl = getDashboardUrl(user.role);
      if (currentPath !== correctUrl) {
        setTimeout(() => {
          window.location.href = correctUrl;
        }, 100);
        return false;
      }
    }

    return true;
  }, [user, getDashboardUrl]);

  // Initialize auth state ONLY if we have refresh token
  useEffect(() => {
    if (!initialUser && !initialAccessToken && typeof window !== 'undefined') {
      const initializeAuth = async () => {
        const hasToken = await checkRefreshToken();
        
        if (hasToken) {
          setLoading(true);
          try {
            const newToken = await refreshToken();
            if (newToken) {
            }
          } catch (error) {
          } finally {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      };

      initializeAuth();
    } else {
      setLoading(false);
    }
  }, [initialUser, initialAccessToken, refreshToken, checkRefreshToken]);

  // Check route access after user is loaded
  useEffect(() => {
    if (!loading && user) {
      const canAccess = canAccessCurrentRoute();
      if (!canAccess) {
      }
    }
  }, [user, loading, canAccessCurrentRoute]);

  // Auto refresh token ONLY if user is authenticated
  useEffect(() => {
    if (!accessToken || !user || typeof window === 'undefined') return;

    const refreshInterval = setInterval(async () => {
      try {
        await refreshToken();
      } catch (error) {
        // If refresh fails, logout user
        await logout();
      }
    }, 14 * 60 * 1000); // Refresh every 14 minutes

    return () => {
      clearInterval(refreshInterval);
    };
  }, [accessToken, user, refreshToken, logout]);

  // Handle page unload - cleanup
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeUnload = () => {
      // Could add any cleanup logic here if needed
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    refreshToken,
    isAuthenticated: !!user && !!accessToken,
    getDashboardUrl,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};