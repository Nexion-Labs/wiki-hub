import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { cookie } from '@elysiajs/cookie';
import { authService } from '../services/auth.service';
import { authMiddleware, requireAuth } from '../middleware/auth';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} from '../validators/auth.validator';
import { env } from '../config/env';
import { parseTokenExpiry } from '../utils/jwt';

export const authRoutes = new Elysia({ prefix: '/auth' })
  .use(
    jwt({
      name: 'jwt',
      secret: env.JWT_SECRET,
      exp: env.JWT_EXPIRES_IN,
    })
  )
  .use(cookie())
  .use(authMiddleware)
  .post(
    '/register',
    async ({ body, set }) => {
      const validated = registerSchema.parse(body);
      const result = await authService.register(validated);

      set.status = 201;
      return {
        success: true,
        message: 'Registration successful',
        data: {
          user: result.user,
          role: result.role,
        },
      };
    },
    {
      body: t.Object({
        email: t.String(),
        username: t.String(),
        password: t.String(),
        fullName: t.Optional(t.String()),
      }),
    }
  )
  .post(
    '/login',
    async ({ body, jwt, cookie, set, request }) => {
      const validated = loginSchema.parse(body);

      // Get IP and user agent
      const ipAddress = request.headers.get('x-forwarded-for') ||
                       request.headers.get('x-real-ip') ||
                       'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';

      const result = await authService.login(validated, ipAddress, userAgent);

      // Create access token
      const accessToken = await jwt.sign({
        userId: result.user.id,
        email: result.user.email,
        username: result.user.username,
        role: result.role.name,
        permissions: result.role.permissions,
      });

      // Set cookies
      const accessTokenExpiry = parseTokenExpiry(env.JWT_EXPIRES_IN);
      const refreshTokenExpiry = parseTokenExpiry(env.JWT_REFRESH_EXPIRES_IN);

      cookie.accessToken.set({
        value: accessToken,
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: accessTokenExpiry / 1000,
        path: '/',
      });

      cookie.refreshToken.set({
        value: result.refreshToken,
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: refreshTokenExpiry / 1000,
        path: '/',
      });

      return {
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          role: result.role,
          accessToken,
        },
      };
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  .post('/refresh', async ({ jwt, cookie }) => {
    const refreshToken = cookie.refreshToken.value;
    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }

    const result = await authService.refreshAccessToken(refreshToken);

    // Create new access token
    const accessToken = await jwt.sign({
      userId: result.user.id,
      email: result.user.email,
      username: result.user.username,
      role: result.role.name,
      permissions: result.role.permissions,
    });

    // Update cookies
    const accessTokenExpiry = parseTokenExpiry(env.JWT_EXPIRES_IN);
    const refreshTokenExpiry = parseTokenExpiry(env.JWT_REFRESH_EXPIRES_IN);

    cookie.accessToken.set({
      value: accessToken,
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: accessTokenExpiry / 1000,
      path: '/',
    });

    cookie.refreshToken.set({
      value: result.refreshToken,
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshTokenExpiry / 1000,
      path: '/',
    });

    return {
      success: true,
      message: 'Token refreshed',
      data: {
        user: result.user,
        role: result.role,
        accessToken,
      },
    };
  })
  .post('/logout', async ({ cookie }) => {
    const refreshToken = cookie.refreshToken.value;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    // Clear cookies
    cookie.accessToken.remove();
    cookie.refreshToken.remove();

    return {
      success: true,
      message: 'Logout successful',
    };
  })
  .get('/me', async ({ user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    return {
      success: true,
      data: user,
    };
  })
  .put(
    '/me/password',
    async ({ body, user }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const validated = changePasswordSchema.parse(body);
      await authService.changePassword(
        user.userId,
        validated.currentPassword,
        validated.newPassword
      );

      return {
        success: true,
        message: 'Password changed successfully',
      };
    },
    {
      body: t.Object({
        currentPassword: t.String(),
        newPassword: t.String(),
      }),
    }
  );
