import { createServerFn } from '@tanstack/react-start';
import { redirect } from '@tanstack/react-router';
import { AuthService } from '../services/auth.service';
import { 
  getSession, 
  setSessionCookies, 
  clearSessionCookies,
  getRefreshToken,
} from '../utils/session';
import type { SessionUser } from '../../types/session';
import { z } from 'zod';

const authService = new AuthService();

// Schema validation
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(8),
  fullName: z.string().optional(),
});

// Get current session user (from cookies)
export const getSessionUser = createServerFn({ method: 'GET' })
  .handler(async (): Promise<{ success: boolean; data: SessionUser | null }> => {
    try {
      const user = await getSession();
      return { success: true, data: user };
    } catch (error) {
      return { success: false, data: null };
    }
  });

// Login - sets session cookies
export const loginFn = createServerFn({ method: 'POST' })
  .inputValidator(loginSchema)
  .handler(async ({ data }) => {
    try {
      const result = await authService.login(data);
      
      // Set session cookies
      await setSessionCookies(result.refreshToken, result.user.id);
      
      return { 
        success: true, 
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            username: result.user.username,
            fullName: result.user.fullName,
            role: result.role.name,
            roleId: result.user.roleId,
            isActive: result.user.isActive,
          }
        }
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      return { success: false, error: message, data: null };
    }
  });

// Register - auto login after registration
export const registerFn = createServerFn({ method: 'POST' })
  .inputValidator(registerSchema)
  .handler(async ({ data }) => {
    try {
      const result = await authService.register(data);
      
      // Auto login after registration
      const loginResult = await authService.login({
        email: data.email,
        password: data.password,
      });
      
      // Set session cookies
      await setSessionCookies(loginResult.refreshToken, loginResult.user.id);
      
      return { 
        success: true, 
        data: {
          user: {
            id: loginResult.user.id,
            email: loginResult.user.email,
            username: loginResult.user.username,
            fullName: loginResult.user.fullName,
            role: loginResult.role.name,
            roleId: loginResult.user.roleId,
            isActive: loginResult.user.isActive,
          }
        }
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      return { success: false, error: message, data: null };
    }
  });

// Logout - clears session cookies
export const logoutFn = createServerFn({ method: 'POST' })
  .handler(async () => {
    try {
      const refreshToken = getRefreshToken();
      
      // Invalidate session in database
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      
      // Clear cookies
      clearSessionCookies();
      
      return { success: true };
    } catch (error) {
      // Still clear cookies even if database operation fails
      clearSessionCookies();
      const message = error instanceof Error ? error.message : 'Logout failed';
      return { success: false, error: message };
    }
  });

// Protected route helper - throws redirect if not authenticated
export const requireAuth = createServerFn({ method: 'GET' })
  .handler(async () => {
    const user = await getSession();
    if (!user) {
      throw redirect({ to: '/login' });
    }
    return { success: true, data: user };
  });

// Admin route helper - throws redirect if not admin
export const requireAdmin = createServerFn({ method: 'GET' })
  .handler(async () => {
    const user = await getSession();
    if (!user) {
      throw redirect({ to: '/login' });
    }
    if (user.role !== 'admin') {
      throw redirect({ to: '/' });
    }
    return { success: true, data: user };
  });

// Check if user has specific role
export const checkRole = createServerFn({ method: 'GET' })
  .inputValidator((data: { roles: string[] }) => data)
  .handler(async ({ data }) => {
    const user = await getSession();
    if (!user) {
      return { success: false, hasRole: false, user: null };
    }
    const hasRole = data.roles.includes(user.role);
    return { success: true, hasRole, user };
  });

