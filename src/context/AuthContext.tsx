"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { getProfile, loginUser as apiLogin, logoutUser } from "@/lib/LoginApi";
import type { User, AuthContextType, LoginPayload } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null); 
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        setToken(storedToken);
        try {
          const userData = await getProfile(storedToken);
          setUser(userData);
        } catch (error) {
          console.error("Session expired or token invalid.", error);
          localStorage.removeItem('accessToken'); 
          setToken(null);
        }
      }
      setLoading(false);
    };
    checkUserLoggedIn();
  }, []);

  const login = async (payload: LoginPayload) => {
    const { user, access_token } = await apiLogin(payload);
    localStorage.setItem('accessToken', access_token); 
    setToken(access_token);
    setUser(user);
    router.push("/dashboard");
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      setUser(null);
      setToken(null);
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