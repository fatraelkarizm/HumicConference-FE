// Tipe untuk object User sesuai data dari backend
export interface User {
  id: string;
  name: string;
  email: string;
  profile_uri: string | null;
  role: 'SUPER_ADMIN' | 'ADMIN_ICICYTA' | 'ADMIN_ICODSA'; // FIXED: ICODSA
  banned_at: string | null;
  verified_at: string | null;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Tipe untuk Admin (sama dengan User tapi untuk admin management)
export interface Admin {
  id: string;
  fullName: string; // mapping dari name
  email: string;
  role: 'ADMIN_ICICYTA' | 'ADMIN_ICODSA'; // FIXED: ICODSA
  createdAt: string; // mapping dari created_at
  profile_uri?: string | null;
  verified_at?: string | null;
  banned_at?: string | null;
  last_login?: string | null;
  updated_at?: string;
  deleted_at?: string | null;
}

// Tipe untuk AdminRow (untuk table display)
export interface AdminRow {
  id: string;
  fullName: string;
  email: string;
  role: string;
  joinedAt: string;
  lastActive?: string;
  avatarUrl?: string;
}

// Tipe untuk create admin payload
export interface CreateAdminPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'ADMIN_ICICYTA' | 'ADMIN_ICODSA'; // FIXED: ICODSA
}

// Tipe untuk update admin payload
export interface UpdateAdminPayload {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  role?: 'ADMIN_ICICYTA' | 'ADMIN_ICODSA'; // FIXED: ICODSA
}

// Existing types...
export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface ApiResponse<T> {
  code: number;
  status: string;
  message: string;
  pagination: any | null;
  data: T;
  errors: any | null;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
  isAuthenticated: boolean;
  getDashboardUrl: (role: string) => string;
}

export interface ServerAuthResult {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
}

// FIXED ROLE_ROUTES - update ICODSA
export const ROLE_ROUTES = {
  SUPER_ADMIN: '/super-admin/dashboard',
  ADMIN_ICICYTA: '/admin/ICICyTA',
  ADMIN_ICODSA: '/admin/ICODSA', // FIXED: ICODSA
} as const;