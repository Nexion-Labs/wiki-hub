import { Elysia, t } from 'elysia';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { eolService } from '../services/eol.service';

export const eolRoutes = new Elysia({ prefix: '/eol' })
  .use(authMiddleware)
  // Public read routes
  .get('/products', async ({ query }) => {
    const limit = parseInt(query.limit || '50');
    const offset = parseInt(query.offset || '0');

    const products = await eolService.listProducts(limit, offset);

    return {
      success: true,
      data: products,
    };
  })
  .get('/product/slug/:slug', async ({ params: { slug } }) => {
    const product = await eolService.getProduct(slug);

    return {
      success: true,
      data: product,
    };
  })
  .get('/product/id/:id/versions', async ({ params: { id } }) => {
    const versions = await eolService.getVersionsByProduct(id);

    return {
      success: true,
      data: versions,
    };
  })
  .get('/versions/expiring', async ({ query }) => {
    const daysAhead = parseInt(query.days || '90');
    const versions = await eolService.getExpiringVersions(daysAhead);

    return {
      success: true,
      data: versions,
    };
  })
  // Admin/Editor-only routes for product and version management
  .guard(
    {
      beforeHandle: async ({ user }) => {
        if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
          throw new Error('Admin or Editor role required');
        }
      },
    },
    (app) =>
      app
        .post(
          '/products',
          async ({ body, user, set }) => {
            const product = await eolService.createProduct(body, user!.userId);

            set.status = 201;
            return {
              success: true,
              message: 'Product created successfully',
              data: product,
            };
          },
          {
            body: t.Object({
              name: t.String(),
              vendor: t.Optional(t.String()),
              description: t.Optional(t.String()),
              productType: t.Optional(t.String()),
              homepageUrl: t.Optional(t.String()),
              documentationUrl: t.Optional(t.String()),
            }),
          }
        )
        .put(
          '/products/:id',
          async ({ params: { id }, body }) => {
            const product = await eolService.updateProduct(id, body);

            return {
              success: true,
              message: 'Product updated successfully',
              data: product,
            };
          },
          {
            body: t.Object({
              name: t.Optional(t.String()),
              vendor: t.Optional(t.String()),
              description: t.Optional(t.String()),
              productType: t.Optional(t.String()),
              homepageUrl: t.Optional(t.String()),
              documentationUrl: t.Optional(t.String()),
            }),
          }
        )
        .delete('/products/:id', async ({ params: { id } }) => {
          await eolService.deleteProduct(id);

          return {
            success: true,
            message: 'Product deleted successfully',
          };
        })
        .post(
          '/versions',
          async ({ body, user, set }) => {
            const version = await eolService.createVersion(body, user!.userId);

            set.status = 201;
            return {
              success: true,
              message: 'Version created successfully',
              data: version,
            };
          },
          {
            body: t.Object({
              productId: t.String(),
              versionNumber: t.String(),
              releaseDate: t.Optional(t.String()),
              eolDate: t.String(),
              extendedSupportDate: t.Optional(t.String()),
              lts: t.Optional(t.Boolean()),
              lifecycleStage: t.String(),
              notes: t.Optional(t.String()),
            }),
          }
        )
        .put(
          '/versions/:id',
          async ({ params: { id }, body }) => {
            const version = await eolService.updateVersion(id, body);

            return {
              success: true,
              message: 'Version updated successfully',
              data: version,
            };
          },
          {
            body: t.Object({
              versionNumber: t.Optional(t.String()),
              releaseDate: t.Optional(t.String()),
              eolDate: t.Optional(t.String()),
              extendedSupportDate: t.Optional(t.String()),
              lts: t.Optional(t.Boolean()),
              lifecycleStage: t.Optional(t.String()),
              notes: t.Optional(t.String()),
            }),
          }
        )
        .delete('/versions/:id', async ({ params: { id } }) => {
          await eolService.deleteVersion(id);

          return {
            success: true,
            message: 'Version deleted successfully',
          };
        })
  )
  // Alert routes - accessible to all authenticated users
  .post(
    '/alerts',
    async ({ body, user, set }) => {
      if (!user) {
        throw new Error('Authentication required');
      }

      const alert = await eolService.subscribeToAlert(
        user.userId,
        body.versionId,
        body.alertDaysBefore
      );

      set.status = 201;
      return {
        success: true,
        message: 'Alert subscription created',
        data: alert,
      };
    },
    {
      body: t.Object({
        versionId: t.String(),
        alertDaysBefore: t.Optional(t.Number()),
      }),
    }
  )
  .get('/alerts', async ({ user }) => {
    if (!user) {
      throw new Error('Authentication required');
    }

    const alerts = await eolService.getUserAlerts(user.userId);

    return {
      success: true,
      data: alerts,
    };
  })
  .delete('/alerts/:id', async ({ params: { id }, user }) => {
    if (!user) {
      throw new Error('Authentication required');
    }

    await eolService.unsubscribeFromAlert(id);

    return {
      success: true,
      message: 'Alert subscription deleted',
    };
  });
