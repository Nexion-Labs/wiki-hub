// Session and auth types
// These are separated from server code to avoid bundling issues

export interface SessionUser {
  id: string;
  email: string;
  username: string;
  fullName: string | null;
  role: string;
  roleId: string;
  isActive: boolean;
}

export interface AuthResult {
  success: boolean;
  data?: SessionUser;
  error?: string;
}

export interface LoginResult {
  success: boolean;
  data?: {
    user: SessionUser;
  };
  error?: string;
}
