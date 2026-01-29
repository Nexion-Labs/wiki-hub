import { ForbiddenError } from '../utils/errors';
import type { JWTPayload } from '../utils/jwt';

export const hasPermission = (
  user: JWTPayload | null,
  resource: 'wiki' | 'eol' | 'users',
  action: string
): boolean => {
  if (!user) return false;

  const permissions = user.permissions[resource] || [];

  // Admin has all permissions
  if (user.role === 'admin') return true;

  // Check if user has the specific permission
  return permissions.includes(action);
};

export const hasRole = (user: JWTPayload | null, ...roles: string[]): boolean => {
  if (!user) return false;
  return roles.includes(user.role);
};

export const requirePermission = (
  resource: 'wiki' | 'eol' | 'users',
  action: string
) => {
  return (app: any) =>
    app.derive(({ user }: { user: JWTPayload | null }) => {
      if (!hasPermission(user, resource, action)) {
        throw new ForbiddenError('Insufficient permissions');
      }
      return { user };
    });
};

export const requireRole = (...roles: string[]) => {
  return (app: any) =>
    app.derive(({ user }: { user: JWTPayload | null }) => {
      if (!hasRole(user, ...roles)) {
        throw new ForbiddenError('Insufficient role');
      }
      return { user };
    });
};

export const requireOwnership = (getUserId: (context: any) => string) => {
  return (app: any) =>
    app.derive((context: any) => {
      const { user } = context;
      if (!user) {
        throw new ForbiddenError('Authentication required');
      }

      // Admin and editor can access any resource
      if (user.role === 'admin' || user.role === 'editor') {
        return { user };
      }

      // Contributors can only access their own resources
      const resourceUserId = getUserId(context);
      if (user.userId !== resourceUserId) {
        throw new ForbiddenError('You can only modify your own resources');
      }

      return { user };
    });
};
