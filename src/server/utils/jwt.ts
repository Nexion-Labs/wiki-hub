import { env } from '../config/env';
import type { User, Role } from '../db/schema';

export interface JWTPayload {
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

export const createAccessToken = async (
  user: User,
  role: Role
): Promise<string> => {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    username: user.username,
    role: role.name,
    permissions: role.permissions,
  };

  // We'll use Elysia's JWT plugin in the routes
  return JSON.stringify(payload);
};

export const createRefreshToken = (): string => {
  return crypto.randomUUID();
};

export const parseTokenExpiry = (expiry: string): number => {
  const units: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error('Invalid expiry format');

  const [, value, unit] = match;
  return parseInt(value) * units[unit];
};
