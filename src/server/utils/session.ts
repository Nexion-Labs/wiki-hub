import { getCookie, setCookie, deleteCookie } from '@tanstack/react-start/server';
import { userRepository } from '../repositories/user.repository';
import { roleRepository } from '../repositories/role.repository';
import type { SessionUser } from '../../types/session';

// Re-export type for convenience
export type { SessionUser };

// Session cookie names
const SESSION_COOKIE = 'wiki_session';
const REFRESH_TOKEN_COOKIE = 'wiki_refresh_token';

// Cookie options
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

// Set session cookies after login
export async function setSessionCookies(refreshToken: string, userId: string) {
  // Set refresh token cookie (7 days)
  setCookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  // Set session cookie with user ID (15 minutes, will be refreshed)
  setCookie(SESSION_COOKIE, userId, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60, // 15 minutes
  });
}

// Clear session cookies on logout
export function clearSessionCookies() {
  deleteCookie(SESSION_COOKIE, { path: '/' });
  deleteCookie(REFRESH_TOKEN_COOKIE, { path: '/' });
}

// Get current session from cookies
export async function getSession(): Promise<SessionUser | null> {
  try {
    const userId = getCookie(SESSION_COOKIE);
    const refreshToken = getCookie(REFRESH_TOKEN_COOKIE);

    if (!userId && !refreshToken) {
      return null;
    }

    // If we have userId, try to get user directly
    if (userId) {
      const user = await userRepository.findByIdWithRole(userId);
      if (user && user.isActive) {
        const role = await roleRepository.findById(user.roleId);
        return {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          role: role?.name || 'viewer',
          roleId: user.roleId,
          isActive: user.isActive,
        };
      }
    }

    // If session cookie expired but refresh token exists, validate refresh token
    if (refreshToken) {
      const session = await userRepository.findSessionByToken(refreshToken);
      if (session && new Date() < session.expiresAt) {
        const user = await userRepository.findByIdWithRole(session.userId);
        if (user && user.isActive) {
          // Refresh the session cookie
          setCookie(SESSION_COOKIE, user.id, {
            ...COOKIE_OPTIONS,
            maxAge: 15 * 60,
          });

          const role = await roleRepository.findById(user.roleId);
          return {
            id: user.id,
            email: user.email,
            username: user.username,
            fullName: user.fullName,
            role: role?.name || 'viewer',
            roleId: user.roleId,
            isActive: user.isActive,
          };
        }
      }
    }

    // Clear invalid cookies
    clearSessionCookies();
    return null;
  } catch (error) {
    console.error('Session error:', error);
    return null;
  }
}

// Get refresh token from cookie
export function getRefreshToken(): string | null {
  return getCookie(REFRESH_TOKEN_COOKIE) || null;
}

// Check if user has required role
export function hasRole(user: SessionUser | null, requiredRoles: string[]): boolean {
  if (!user) return false;
  return requiredRoles.includes(user.role);
}

// Check if user is admin
export function isAdmin(user: SessionUser | null): boolean {
  return hasRole(user, ['admin']);
}

// Check if user is at least editor
export function isEditor(user: SessionUser | null): boolean {
  return hasRole(user, ['admin', 'editor']);
}

// Check if user is at least contributor
export function isContributor(user: SessionUser | null): boolean {
  return hasRole(user, ['admin', 'editor', 'contributor']);
}
