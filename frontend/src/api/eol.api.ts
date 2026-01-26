import { api } from '../lib/axios';

export interface EOLProduct {
  id: string;
  name: string;
  slug: string;
  vendor?: string;
  description?: string;
  productType?: string;
  createdAt: string;
}

export interface EOLVersion {
  id: string;
  productId: string;
  versionNumber: string;
  releaseDate?: string;
  eolDate: string;
  extendedSupportDate?: string;
  lifecycleStage: string;
  lts: boolean;
  notes?: string;
  createdAt: string;
}

export interface EOLProductDetail extends EOLProduct {
  homepageUrl?: string;
  documentationUrl?: string;
  license?: string;
  iconUrl?: string;
  versions?: EOLVersion[];
}

export const eolApi = {
  getProducts: (params?: { limit?: number; offset?: number }) =>
    api.get('/eol/products', { params }),

  getProduct: (slug: string) => api.get(`/eol/product/slug/${slug}`),

  createProduct: (data: any) => api.post('/eol/products', data),

  updateProduct: (id: string, data: Partial<EOLProduct>) =>
    api.put(`/eol/products/${id}`, data),

  deleteProduct: (id: string) => api.delete(`/eol/products/${id}`),

  getVersions: (productId: string) =>
    api.get(`/eol/product/id/${productId}/versions`),

  createVersion: (data: any) => api.post('/eol/versions', data),

  updateVersion: (id: string, data: Partial<EOLVersion>) =>
    api.put(`/eol/versions/${id}`, data),

  deleteVersion: (id: string) => api.delete(`/eol/versions/${id}`),

  getExpiringVersions: (days?: number) =>
    api.get('/eol/versions/expiring', { params: { days } }),

  subscribeToAlert: (versionId: string, alertDaysBefore?: number) =>
    api.post('/eol/alerts', { versionId, alertDaysBefore }),

  getUserAlerts: () => api.get('/eol/alerts'),

  unsubscribeFromAlert: (alertId: string) =>
    api.delete(`/eol/alerts/${alertId}`),
};
