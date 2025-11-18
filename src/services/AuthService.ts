import { LoginPayload, LoginResponse, RefreshTokenResponse, ApiResponse, User } from '@/types/auth';

class AuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  }

  async login(loginData: LoginPayload): Promise<LoginResponse> {
    try {
      if (!loginData || typeof loginData !== 'object') {
        throw new Error('Invalid login data');
      }

      if (!loginData.email || typeof loginData.email !== 'string') {
        throw new Error('Email is required and must be a string');
      }

      if (!loginData.password || typeof loginData.password !== 'string') {
        throw new Error('Password is required and must be a string');
      }

      const cleanLoginData = {
        email: loginData.email.trim(),
        password: loginData.password
      };

      // HIT API ROUTE INSTEAD OF DIRECT BACKEND
      const loginUrl = '/api/auth/login';

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(cleanLoginData),
        credentials: 'include',
      });


      const result = await response.json();

      if (!response.ok) {
        if (result.errors && result.errors.validation) {
          const validationErrors = result.errors.validation;
          const errorMessages = [];

          if (validationErrors.email) {
            errorMessages.push(...validationErrors.email);
          }
          if (validationErrors.password) {
            errorMessages.push(...validationErrors.password);
          }

          throw new Error(errorMessages.join(', ') || result.message);
        }

        throw new Error(result.message || `HTTP Error: ${response.status}`);
      }

      if (result.code !== 200) {
        throw new Error(result.message || 'Login failed');
      }

      if (!result.data) {
        throw new Error('No data received from server');
      }


      // Now access token should be in result.data.accessToken (thanks to API route)
      const userData = {
        id: result.data.id,
        name: result.data.name,
        email: result.data.email,
        profile_uri: result.data.profile_uri,
        role: result.data.role,
        verified_at: result.data.verified_at,
        created_at: result.data.created_at,
        updated_at: result.data.updated_at,
        deleted_at: result.data.deleted_at,
        banned_at: result.data.banned_at,
        last_login: result.data.last_login,
      };

      const accessToken = result.data.accessToken;

      if (!accessToken) {
        throw new Error('No access token received from server');
      }

      // Verify refresh token was set via correct API endpoint
      if (typeof window !== 'undefined') {
        setTimeout(async () => {
          try {
            const checkResponse = await fetch('/api/auth/refresh', {
              method: 'GET',
              credentials: 'include'
            });
            const checkResult = await checkResponse.json();
          } catch (error) {
          }
        }, 500);
      }

      return {
        user: userData,
        accessToken: accessToken,
        refreshToken: 'httponly-cookie',
      };
    } catch (error: any) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await fetch('/api/auth/clear-token', {
        method: 'POST',
        credentials: 'include',
      });
    }
  }

  async refreshAccessToken(): Promise<string | null> {
    try {

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      const result = await response.json();

      if (result.code !== 200) {
        return null;
      }

      // Access token sekarang ada di result.data.accessToken (thanks to API route fix)
      let accessToken = null;

      if (result.data && result.data.accessToken) {
        accessToken = result.data.accessToken;
      } else {
        return null;
      }

      return accessToken;
    } catch (error) {
      return null;
    }
  }

  async getCurrentUser(accessToken: string): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      const result = await response.json();

      if (result.code !== 200) {
        return null;
      }

      return result.data;
    } catch (error) {
      return null;
    }
  }

  async serverSideAuthCheck(request: Request): Promise<{ isAuthenticated: boolean; user: User | null; accessToken: string | null }> {
    try {
      const refreshToken = this.getRefreshTokenFromCookies(request);

      if (!refreshToken) {
        return { isAuthenticated: false, user: null, accessToken: null };
      }

      const response = await fetch(`${this.baseUrl}/api/v1/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: refreshToken
        }),
      });

      if (!response.ok) {
        return { isAuthenticated: false, user: null, accessToken: null };
      }

      const refreshResult = await response.json();

      if (refreshResult.code !== 200) {
        return { isAuthenticated: false, user: null, accessToken: null };
      }

      const accessToken = refreshResult.data.accessToken;
      const user = await this.getCurrentUser(accessToken);

      return {
        isAuthenticated: !!user,
        user,
        accessToken,
      };
    } catch (error) {
      console.error('Server side auth check error:', error);
      return { isAuthenticated: false, user: null, accessToken: null };
    }
  }

  private getRefreshTokenFromCookies(request: Request): string | null {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    return cookies.refresh_token || null;
  }
}

export default new AuthService();