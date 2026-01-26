import { api } from '../lib/axios';

export interface WikiPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  contentMarkdown: string;
  authorId: string;
  isPublished: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWikiPageData {
  title: string;
  contentMarkdown: string;
  categoryIds?: string[];
  tagIds?: string[];
  isPublished?: boolean;
}

export interface UpdateWikiPageData {
  title?: string;
  contentMarkdown?: string;
  categoryIds?: string[];
  tagIds?: string[];
  isPublished?: boolean;
  changeSummary?: string;
}

export const wikiApi = {
  getPages: (params?: { limit?: number; offset?: number; search?: string }) =>
    api.get('/wiki/pages', { params }),

  getPage: (slug: string) => api.get(`/wiki/pages/${slug}`),

  createPage: (data: CreateWikiPageData) => api.post('/wiki/pages', data),

  updatePage: (id: string, data: UpdateWikiPageData) =>
    api.put(`/wiki/pages/${id}`, data),

  deletePage: (id: string) => api.delete(`/wiki/pages/${id}`),

  getVersions: (pageId: string) => api.get(`/wiki/pages/${pageId}/versions`),

  revertToVersion: (pageId: string, versionNumber: number) =>
    api.post(`/wiki/pages/${pageId}/revert/${versionNumber}`),
};
