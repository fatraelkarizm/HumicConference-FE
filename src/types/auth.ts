// Tipe untuk object User sesuai data dari backend
export interface User {
  id: string;
  name: string;
  email: string;
  profile_uri: string | null;
  role: string;
  banned_at: string | null;
  verified_at: string | null;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Tipe data yang kita kirim ke backend saat login
export interface LoginPayload {
  email: string;
  password: string;
}

// Tipe data yang diterima dari backend saat login
export interface LoginData {
  user: User;
  token: string; 
}

// Tipe generic untuk semua respons dari API kamu
export interface ApiResponse<T> {
  code: number;
  status: string;
  message: string;
  pagination: any | null;
  data: T;
  errors: any | null;
}
// Tipe untuk konteks autentikasi
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}