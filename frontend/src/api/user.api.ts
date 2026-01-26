import { api } from '../lib/axios';

export interface User {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  roleId: string;
  isActive: boolean;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: {
    wiki: string[];
    eol: string[];
    users: string[];
  };
}

export const userApi = {
  getUsers: (params?: { limit?: number; offset?: number }) =>
    api.get('/users', { params }),

  getUser: (id: string) => api.get(`/users/${id}`),

  createUser: (data: {
    email: string;
    username: string;
    password: string;
    fullName?: string;
    roleId: string;
  }) => api.post('/users', data),

  updateUser: (
    id: string,
    data: {
      email?: string;
      username?: string;
      fullName?: string;
      isActive?: boolean;
    }
  ) => api.put(`/users/${id}`, data),

  updateUserRole: (id: string, roleId: string) =>
    api.put(`/users/${id}/role`, { roleId }),

  deleteUser: (id: string) => api.delete(`/users/${id}`),

  deactivateUser: (id: string) => api.post(`/users/${id}/deactivate`),

  getRoles: () => api.get<{ success: boolean; data: Role[] }>('/users/roles'),
};
