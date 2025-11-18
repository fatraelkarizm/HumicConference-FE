// =================== COMMON API TYPES ===================
export interface BackendApiResponse<T> {
  code: number;
  status: string;
  message: string;
  pagination?: any;
  data: T;
  errors?: any;
}

// Common pagination interface
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Common filter interface
export interface FilterParams {
  [key: string]: string | number | boolean | undefined;
}