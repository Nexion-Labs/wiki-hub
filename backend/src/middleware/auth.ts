import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { cookie } from '@elysiajs/cookie';
import { env } from '../config/env';
import { userRepository } from '../repositories/user.repository';
import { UnauthorizedError } from '../utils/errors';
import type { JWTPayload } from '../utils/jwt';

export const authMiddleware = new Elysia({ name: 'auth' })
  .use(
    jwt({
      name: 'jwt',
      secret: env.JWT_SECRET,
      exp: env.JWT_EXPIRES_IN,
    })
  )
  .use(cookie())
  .derive(async ({ jwt, cookie: { accessToken } }) => {
    if (!accessToken) {
      return { user: null };
    }

    try {
      const payload = await jwt.verify(accessToken);
      if (!payload) {
        return { user: null };
      }

      return { user: payload as JWTPayload };
    } catch (error) {
      return { user: null };
    }
  })
  .macro(({ onBeforeHandle }) => ({
    isAuthenticated(enabled: boolean) {
      if (!enabled) return;

      onBeforeHandle(async ({ user }) => {
        if (!user) {
          throw new UnauthorizedError('Authentication required');
        }
      });
    },
  }));

export const requireAuth = () => {
  return (app: any) =>
    app.derive(({ user }: any) => {
      if (!user) {
        throw new UnauthorizedError('Authentication required');
      }
      return { user };
    });
};
