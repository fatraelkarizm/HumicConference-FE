import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/router";
import { getProfile, logoutUser } from "@/lib/LoginApi";
import type { User, AuthContextType } from "@/types/auth";

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
        // Kalo gagal, berarti tidak ada sesi yang valid.
        console.log("No active session found.");
      }
      setLoading(false);
    };
    checkUserLoggedIn();
  }, []);

  // Login Menerima data User
  const login = (userData: User) => {
    setUser(userData);
    router.push("/dashboard");
  };

  // Logout memanggil API buat hapus cookie di server
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
