// API client for calling the backend
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || 'Request failed',
      };
    }

    return {
      success: true,
      data: data.data ?? data,
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

export const api = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint),
  
  post: <T>(endpoint: string, body: unknown) =>
    fetchApi<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  
  put: <T>(endpoint: string, body: unknown) =>
    fetchApi<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  
  patch: <T>(endpoint: string, body: unknown) =>
    fetchApi<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  
  delete: <T>(endpoint: string) =>
    fetchApi<T>(endpoint, {
      method: 'DELETE',
    }),
};

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ user: any; accessToken: string }>('/api/auth/login', { email, password }),
  
  register: (data: { email: string; password: string; username: string; fullName?: string }) =>
    api.post<{ user: any }>('/api/auth/register', data),
  
  logout: () => api.post('/api/auth/logout', {}),
  
  getCurrentUser: () => api.get<any>('/api/auth/me'),
  
  refreshToken: () => api.post<{ accessToken: string }>('/api/auth/refresh', {}),
};

// EOL API
export const eolApi = {
  listProducts: (limit = 50, offset = 0) =>
    api.get<any[]>(`/api/eol?limit=${limit}&offset=${offset}`),
  
  getProduct: (slug: string) => api.get<any>(`/api/eol/${slug}`),
  
  createProduct: (data: any) => api.post<any>('/api/eol', data),
  
  updateProduct: (id: string, data: any) => api.put<any>(`/api/eol/${id}`, data),
  
  deleteProduct: (id: string) => api.delete(`/api/eol/${id}`),
  
  getVersions: (productId: string) => api.get<any[]>(`/api/eol/${productId}/versions`),
  
  createVersion: (productId: string, data: any) =>
    api.post<any>(`/api/eol/${productId}/versions`, data),
  
  getExpiringVersions: (days = 90) =>
    api.get<any[]>(`/api/eol/expiring?days=${days}`),
};

// Wiki API
export const wikiApi = {
  listPages: (params?: { categoryId?: string; tagIds?: string; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
    if (params?.tagIds) searchParams.set('tagIds', params.tagIds);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    return api.get<any[]>(`/api/wiki?${searchParams}`);
  },
  
  getPage: (slug: string) => api.get<any>(`/api/wiki/${slug}`),
  
  createPage: (data: any) => api.post<any>('/api/wiki', data),
  
  updatePage: (slug: string, data: any) => api.put<any>(`/api/wiki/${slug}`, data),
  
  deletePage: (slug: string) => api.delete(`/api/wiki/${slug}`),
  
  getRevisions: (slug: string) => api.get<any[]>(`/api/wiki/${slug}/revisions`),
  
  searchPages: (query: string) => api.get<any[]>(`/api/wiki/search?q=${encodeURIComponent(query)}`),
};

// User API
export const userApi = {
  listUsers: () => api.get<any[]>('/api/users'),
  
  getUser: (id: string) => api.get<any>(`/api/users/${id}`),
  
  updateUser: (id: string, data: any) => api.put<any>(`/api/users/${id}`, data),
  
  deleteUser: (id: string) => api.delete(`/api/users/${id}`),
};

// Category API
export const categoryApi = {
  list: () => api.get<any[]>('/api/categories'),
  create: (data: any) => api.post<any>('/api/categories', data),
  update: (id: string, data: any) => api.put<any>(`/api/categories/${id}`, data),
  delete: (id: string) => api.delete(`/api/categories/${id}`),
};

// Tag API
export const tagApi = {
  list: () => api.get<any[]>('/api/tags'),
  create: (data: any) => api.post<any>('/api/tags', data),
  update: (id: string, data: any) => api.put<any>(`/api/tags/${id}`, data),
  delete: (id: string) => api.delete(`/api/tags/${id}`),
};
