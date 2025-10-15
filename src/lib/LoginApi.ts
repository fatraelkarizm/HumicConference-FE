import type { LoginPayload, User, ApiResponse } from '../types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Tipe data baru untuk respons login dari backend
interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

// Fungsi login sekarang mengembalikan user dan token
export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const responseJson: ApiResponse<LoginResponse> = await response.json();

  if (!response.ok) {
    throw new Error(responseJson.message || 'Login failed');
  }

  return responseJson.data;
}

// Fungsi getProfile sekarang MENGIRIM token di header
export async function getProfile(token: string): Promise<User> {
  const response = await fetch(`${API_URL}/api/v1/auth/me`, {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // INI KUNCINYA!
    },
  });

  const responseJson: ApiResponse<User> = await response.json();

  if (!response.ok) {
    throw new Error(responseJson.message || 'Failed to fetch user profile');
  }
  return responseJson.data;
}

// Fungsi logout tidak perlu token karena hanya menghapus cookie di sisi server
export async function logoutUser(): Promise<void> {
  const response = await fetch(`${API_URL}/api/v1/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  
  if (!response.ok) {
    console.error('API logout failed.');
  }
}