"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { getProfile, loginUser as apiLogin, logoutUser } from "@/services/AuthService";
import type { User, AuthContextType, LoginPayload } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      // Read token from cookie first (cookies set by loginUser), fallback to localStorage for backward compatibility
      const storedToken = Cookies.get('accessToken') ?? localStorage.getItem('accessToken');
      if (storedToken) {
        setToken(storedToken);
        try {
          const userData = await getProfile(storedToken);
          setUser(userData);
        } catch (error) {
          console.error("Session expired or token invalid.", error);
          Cookies.remove('accessToken');
          localStorage.removeItem('accessToken');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkUserLoggedIn();
  }, []);

  const login = async (payload: LoginPayload) => {
    // apiLogin (loginUser) will set credentials: 'include' so server refresh cookie is stored and it will also set client cookie
    const result = await apiLogin(payload);
    // result may contain user and optionally tokens
    const returnedUser = result.user ?? (result as any).data ?? null;
    const returnedAccessToken = result.access_token ?? undefined;

    // If token wasn't set inside apiLogin for some reason, try reading cookie that apiLogin set
    const cookieToken = Cookies.get('accessToken') ?? returnedAccessToken ?? localStorage.getItem('accessToken');

    if (cookieToken) {
      // persist in memory and optionally localStorage for old code paths
      setToken(cookieToken);
      localStorage.setItem('accessToken', cookieToken);
    }

    if (returnedUser) {
      setUser(returnedUser as User);
    } else {
      // in case backend returned only tokens and no user, fetch profile
      if (cookieToken) {
        const userData = await getProfile(cookieToken);
        setUser(userData);
      }
    }

    // redirect after login
    router.push("/super-admin/dashboard");
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      setUser(null);
      setToken(null);
      Cookies.remove('accessToken');
      localStorage.removeItem('accessToken');
      router.push("/login");
    }
  };

  const value = { user, token, loading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}