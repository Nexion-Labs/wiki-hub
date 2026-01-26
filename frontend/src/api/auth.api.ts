import { api } from '../lib/axios';

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  fullName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  userId: string;
  email: string;
  username: string;
  role: string;
  permissions: {
    wiki: string[];
    eol: string[];
    users: string[];
  };
}

export const authApi = {
  register: (data: RegisterData) => api.post('/auth/register', data),

  login: (data: LoginData) => api.post('/auth/login', data),

  logout: () => api.post('/auth/logout'),

  getCurrentUser: () => api.get<{ success: boolean; data: User }>('/auth/me'),

  refreshToken: () => api.post('/auth/refresh'),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/me/password', { currentPassword, newPassword }),
};
