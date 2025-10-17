// services/AuthService.ts
import Cookies from "js-cookie";
import type { LoginPayload, User, ApiResponse } from '../types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface LoginResponse {
  user?: User;
  access_token?: string;
  refresh_token?: string;
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponse & { user?: User }> {
  const response = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  const authHeader = response.headers.get('Authorization') || response.headers.get('authorization') || null;

  let responseJson: ApiResponse<any> | null = null;
  try {
    responseJson = await response.json();
  } catch (err) {
    responseJson = null;
  }

  if (!response.ok) {
    const msg = responseJson?.message || 'Login failed';
    throw new Error(msg);
  }

  const tokenFromHeader = authHeader ? (authHeader.split(' ')[1] ?? authHeader) : undefined;
  const tokenFromBody = responseJson?.data?.access_token ?? responseJson?.access_token;
  const accessToken = tokenFromBody ?? tokenFromHeader;

  if (accessToken) {
    Cookies.set('accessToken', accessToken, {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  }

  const refreshToken = responseJson?.data?.refresh_token ?? responseJson?.refresh_token;
  const user = responseJson?.data?.user ?? responseJson?.data ?? responseJson;

  return {
    user,
    access_token: accessToken,
    refresh_token: refreshToken,
  };
}

export async function getProfile(token?: string): Promise<User> {
  if (!token) {
    token = Cookies.get('accessToken') ?? undefined;
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_URL}/api/v1/auth/me`, {
    method: 'GET',
    headers,
    credentials: 'include',
  });

  const responseJson: ApiResponse<User> = await response.json();

  if (!response.ok) {
    throw new Error(responseJson.message || 'Failed to fetch user profile');
  }
  return responseJson.data;
}

export async function logoutUser(): Promise<void> {
  try {
    await fetch(`${API_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
  } catch (err) {
    console.error('API logout failed.', err);
  } finally {
    Cookies.remove('accessToken', { path: '/' });
  }
}