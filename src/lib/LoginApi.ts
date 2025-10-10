import type { LoginPayload, LoginData, User, ApiResponse } from '../types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Fungsi login
export async function loginUser(payload: LoginPayload): Promise<User> {
  const response = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  });

  const responseJson: ApiResponse<User> = await response.json();

  if (!response.ok) {
    throw new Error(responseJson.message || 'Login failed');
  }

  return responseJson.data;
}

// Fungsi untuk mendapatkan profil user 
export async function getProfile(): Promise<User> {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', 
  });

  const responseJson: ApiResponse<User> = await response.json();

  if (!response.ok) {
    throw new Error(responseJson.message || 'Failed to fetch user profile');
  }
  return responseJson.data;
}

// Fungsi logout
export async function logoutUser(): Promise<void> {
  const response = await fetch(`${API_URL}/api/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  
  if (!response.ok) {
    console.error('API logout failed.');
  }
}