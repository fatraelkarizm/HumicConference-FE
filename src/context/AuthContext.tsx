// src/context/AuthContext.tsx

"use client"; // WAJIB: Context yang menggunakan hook adalah Client Component

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation"; // UBAH: import dari next/navigation
import { getProfile, logoutUser } from "@/lib/LoginApi";
import type { User, AuthContextType } from "@/types/auth";

// ... (sisa kode AuthContext Anda sama persis, tidak perlu diubah)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const userData = await getProfile();
        setUser(userData);
      } catch (error) {
        console.log("No active session found.");
      }
      setLoading(false);
    };
    checkUserLoggedIn();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    router.push("/dashboard");
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      router.push("/login");
    }
  };
  const value = { user, loading, login, logout };
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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