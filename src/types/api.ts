// Shared API response types for server functions

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data?: T[];
  total?: number;
  page?: number;
  limit?: number;
  error?: string;
}

// Wiki types
export interface WikiPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  contentMarkdown: string;
  authorId: string;
  currentVersionId: string | null;
  isPublished: boolean;
  isDeleted: boolean;
  viewCount: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  deletedAt: Date | null;
}

export interface WikiVersion {
  id: string;
  pageId: string;
  versionNumber: number;
  title: string;
  content: string;
  contentMarkdown: string;
  editorId: string;
  changeSummary: string | null;
  contentDiff: unknown;
  createdAt: Date;
}

// User types
export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string | null;
  roleId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionUser {
  id: string;
  email: string;
  username: string;
  fullName: string | null;
  role: string;
  roleId: string;
  isActive: boolean;
}

// EOL types
export interface EolProduct {
  id: string;
  name: string;
  vendor: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EolVersion {
  id: string;
  productId: string;
  version: string;
  releaseDate: Date | null;
  eolDate: Date | null;
  supportEndDate: Date | null;
  status: string;
  product?: EolProduct;
  createdAt: Date;
  updatedAt: Date;
}

// Auth types
export interface AuthResponse {
  success: boolean;
  data?: {
    user: SessionUser;
  };
  error?: string;
}

export interface LoginResponse extends AuthResponse {}
export interface RegisterResponse extends AuthResponse {}
