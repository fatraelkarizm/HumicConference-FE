import { Admin, CreateAdminPayload, UpdateAdminPayload, ApiResponse } from '@/types/auth';

class AdminService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  }

  // Helper method untuk get access token dari auth context
  private async getAccessToken(): Promise<string | null> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      const result = await response.json();
      return result.data?.accessToken || null;
    } catch {
      return null;
    }
  }

  // Helper method untuk normalize role value - UPDATED ICODSA
  private normalizeRole(role: string): 'ADMIN_ICICYTA' | 'ADMIN_ICODSA' {
    // Handle different role formats from frontend
    const roleStr = role.toUpperCase().replace(/\s+/g, '_');

    if (roleStr.includes('ICICYTA') || roleStr.includes('ICICyTA')) {
      return 'ADMIN_ICICYTA';
    } else if (roleStr.includes('ICODSA') || roleStr.includes('ICoDSA')) { // FIXED: ICODSA
      return 'ADMIN_ICODSA';
    }

    // Default fallback
    return roleStr as 'ADMIN_ICICYTA' | 'ADMIN_ICODSA';
  }

  // Get all admins/users
  async getAdmins(): Promise<Admin[]> {
    try {
      const accessToken = await this.getAccessToken();

      if (!accessToken) {
        throw new Error('Access token not available');
      }

      const response = await fetch(`${this.baseUrl}/api/v1/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const result: ApiResponse<Admin[]> = await response.json();

      if (result.code !== 200) {
        throw new Error(result.message || 'Failed to fetch admins');
      }

      // Map backend response to Admin interface
      const admins = (result.data || []).map((user: any): Admin => ({
        id: user.id,
        fullName: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
        profile_uri: user.profile_uri,
        verified_at: user.verified_at,
        banned_at: user.banned_at,
        last_login: user.last_login,
        updated_at: user.updated_at,
        deleted_at: user.deleted_at,
      }));

      return admins;
    } catch (error: any) {
      throw error;
    }
  }

  // Create new admin
  async createAdmin(payload: { fullName: string; email: string; password?: string; role: string }): Promise<Admin> {
    try {
      const accessToken = await this.getAccessToken();

      if (!accessToken) {
        throw new Error('Access token not available');
      }

      // Normalize role value
      const normalizedRole = this.normalizeRole(payload.role);

      // Map frontend payload to backend format
      const backendPayload: CreateAdminPayload = {
        name: payload.fullName,
        email: payload.email,
        password: payload.password || 'Password123!',
        password_confirmation: payload.password || 'Password123!',
        role: normalizedRole,
      };


      const response = await fetch(`${this.baseUrl}/api/v1/user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(backendPayload),
        credentials: 'include',
      });


      if (!response.ok) {
        let errorMessage = `HTTP Error: ${response.status}`;
        try {
          const errorData = await response.json();

          // Handle validation errors
          if (errorData.errors && errorData.errors.validation) {
            const validationErrors = [];
            const validation = errorData.errors.validation;

            for (const field in validation) {
              if (validation[field] && Array.isArray(validation[field])) {
                validationErrors.push(...validation[field]);
              }
            }

            if (validationErrors.length > 0) {
              errorMessage = validationErrors.join(', ');
            }
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // Ignore
        }

        throw new Error(errorMessage);
      }

      const result: ApiResponse<any> = await response.json();

      if (result.code !== 201 && result.code !== 200) {
        throw new Error(result.message || 'Failed to create admin');
      }

      // Map backend response to Admin interface
      const admin: Admin = {
        id: result.data.id,
        fullName: result.data.name,
        email: result.data.email,
        role: result.data.role,
        createdAt: result.data.created_at,
        profile_uri: result.data.profile_uri,
        verified_at: result.data.verified_at,
        banned_at: result.data.banned_at,
        last_login: result.data.last_login,
        updated_at: result.data.updated_at,
        deleted_at: result.data.deleted_at,
      };

      return admin;
    } catch (error: any) {
      throw error;
    }
  }

  // Update admin
  async updateAdmin(id: string, payload: { fullName: string; email: string; password?: string; role: string }): Promise<Admin> {
    try {
      const accessToken = await this.getAccessToken();

      if (!accessToken) {
        throw new Error('Access token not available');
      }

      // Normalize role value
      const normalizedRole = this.normalizeRole(payload.role);

      // Map frontend payload to backend format
      const backendPayload: UpdateAdminPayload = {
        name: payload.fullName,
        email: payload.email,
        role: normalizedRole,
      };

      // Only add password if provided
      if (payload.password) {
        backendPayload.password = payload.password;
        backendPayload.password_confirmation = payload.password;
      }

      const response = await fetch(`${this.baseUrl}/api/v1/user/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(backendPayload),
        credentials: 'include',
      });

      if (!response.ok) {
        let errorMessage = `HTTP Error: ${response.status}`;
        try {
          const errorData = await response.json();

          if (errorData.errors && errorData.errors.validation) {
            const validationErrors = [];
            const validation = errorData.errors.validation;

            for (const field in validation) {
              if (validation[field] && Array.isArray(validation[field])) {
                validationErrors.push(...validation[field]);
              }
            }

            if (validationErrors.length > 0) {
              errorMessage = validationErrors.join(', ');
            }
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // Ignore
        }

        throw new Error(errorMessage);
      }

      const result: ApiResponse<any> = await response.json();

      if (result.code !== 200) {
        throw new Error(result.message || 'Failed to update admin');
      }

      // Map backend response to Admin interface
      const admin: Admin = {
        id: result.data.id,
        fullName: result.data.name,
        email: result.data.email,
        role: result.data.role,
        createdAt: result.data.created_at,
        profile_uri: result.data.profile_uri,
        verified_at: result.data.verified_at,
        banned_at: result.data.banned_at,
        last_login: result.data.last_login,
        updated_at: result.data.updated_at,
        deleted_at: result.data.deleted_at,
      };

      return admin;
    } catch (error: any) {
      throw error;
    }
  }

  // Delete admin
  async deleteAdmin(id: string): Promise<void> {
    try {
      const accessToken = await this.getAccessToken();

      if (!accessToken) {
        throw new Error('Access token not available');
      }

      const response = await fetch(`${this.baseUrl}/api/v1/user/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        let errorMessage = `HTTP Error: ${response.status}`;
        try {
          const errorData = await response.json();

          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // Ignore
        }

        throw new Error(errorMessage);
      }

      const result: ApiResponse<any> = await response.json();

      if (result.code !== 200) {
        throw new Error(result.message || 'Failed to delete admin');
      }

    } catch (error: any) {
      throw error;
    }
  }

  // Get admin by ID
  async getAdminById(id: string): Promise<Admin> {
    try {
      const accessToken = await this.getAccessToken();

      if (!accessToken) {
        throw new Error('Access token not available');
      }

      const response = await fetch(`${this.baseUrl}/api/v1/user/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const result: ApiResponse<any> = await response.json();

      if (result.code !== 200) {
        throw new Error(result.message || 'Failed to fetch admin');
      }

      // Map backend response to Admin interface
      const admin: Admin = {
        id: result.data.id,
        fullName: result.data.name,
        email: result.data.email,
        role: result.data.role,
        createdAt: result.data.created_at,
        profile_uri: result.data.profile_uri,
        verified_at: result.data.verified_at,
        banned_at: result.data.banned_at,
        last_login: result.data.last_login,
        updated_at: result.data.updated_at,
        deleted_at: result.data.deleted_at,
      };

      return admin;
    } catch (error: any) {
      throw error;
    }
  }
}

// Create instance and export it as default
const adminService = new AdminService();
export default adminService;

// Export individual methods for convenience
export const getAdmins = adminService.getAdmins.bind(adminService);
export const createAdmin = adminService.createAdmin.bind(adminService);
export const updateAdmin = adminService.updateAdmin.bind(adminService);
export const deleteAdmin = adminService.deleteAdmin.bind(adminService);
export const getAdminById = adminService.getAdminById.bind(adminService);