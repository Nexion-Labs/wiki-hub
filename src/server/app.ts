import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { env } from './config/env';
import { authRoutes } from './routes/auth.routes';
import { wikiRoutes } from './routes/wiki.routes';
import { eolRoutes } from './routes/eol.routes';
import { categoryRoutes } from './routes/category.routes';
import { tagRoutes } from './routes/tag.routes';
import { userRoutes } from './routes/user.routes';
import { AppError } from './utils/errors';

export const app = new Elysia()
  .use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  )
  .onError(({ code, error, set }) => {
    // Handle custom errors
    if (error instanceof AppError) {
      set.status = error.statusCode;
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      };
    }

    // Handle validation errors
    if (code === 'VALIDATION') {
      set.status = 400;
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error,
        },
      };
    }

    // Handle not found
    if (code === 'NOT_FOUND') {
      set.status = 404;
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Route not found',
        },
      };
    }

    // Generic error
    console.error('Unhandled error:', error);
    set.status = 500;
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: env.NODE_ENV === 'production'
          ? 'Internal server error'
          : error.message,
      },
    };
  })
  .get('/health', () => ({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  }))
  .group('/api', (app) =>
    app
      .use(authRoutes)
      .use(userRoutes)
      .use(wikiRoutes)
      .use(categoryRoutes)
      .use(tagRoutes)
      .use(eolRoutes)
  )
  // Serve static frontend files in production
  .get('*', ({ path, set }) => {
    // Skip API routes
    if (path.startsWith('/api') || path === '/health') {
      set.status = 404;
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Route not found',
        },
      };
    }

    // Serve static files
    const publicDir = './public';
    const filePath = path === '/' ? '/index.html' : path;
    const fullPath = `${publicDir}${filePath}`;

    try {
      const file = Bun.file(fullPath);

      // If file exists, serve it
      if (file.size > 0) {
        return file;
      }
    } catch (error) {
      // File doesn't exist, continue to SPA fallback
    }

    // SPA fallback - serve index.html for client-side routing
    try {
      const indexFile = Bun.file(`${publicDir}/index.html`);
      if (indexFile.size > 0) {
        set.headers['Content-Type'] = 'text/html';
        return indexFile;
      }
    } catch (error) {
      console.error('Error serving index.html:', error);
    }

    // If no static files available, show API info
    return {
      success: true,
      data: {
        name: 'Wiki Backend API',
        version: '1.0.0',
        status: 'running',
        note: 'Frontend not available - API only mode',
      },
    };
  });
