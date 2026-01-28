import { Elysia, t } from 'elysia';
import { authMiddleware } from '../middleware/auth';
import { categoryService } from '../services/category.service';

export const categoryRoutes = new Elysia({ prefix: '/categories' })
  .use(authMiddleware)
  .get('/', async () => {
    const categories = await categoryService.listCategories();

    return {
      success: true,
      data: categories,
    };
  })
  .get('/:slug', async ({ params: { slug } }) => {
    const category = await categoryService.getCategory(slug);

    return {
      success: true,
      data: category,
    };
  })
  .post(
    '/',
    async ({ body, user, set }) => {
      if (!user) {
        throw new Error('Authentication required');
      }

      const category = await categoryService.createCategory(body);

      set.status = 201;
      return {
        success: true,
        message: 'Category created successfully',
        data: category,
      };
    },
    {
      body: t.Object({
        name: t.String(),
        description: t.Optional(t.String()),
        parentId: t.Optional(t.String()),
        color: t.Optional(t.String()),
        icon: t.Optional(t.String()),
      }),
    }
  )
  .put(
    '/:id',
    async ({ params: { id }, body, user }) => {
      if (!user) {
        throw new Error('Authentication required');
      }

      const category = await categoryService.updateCategory(id, body);

      return {
        success: true,
        message: 'Category updated successfully',
        data: category,
      };
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        description: t.Optional(t.String()),
        color: t.Optional(t.String()),
        icon: t.Optional(t.String()),
      }),
    }
  )
  .delete('/:id', async ({ params: { id }, user }) => {
    if (!user) {
      throw new Error('Authentication required');
    }

    await categoryService.deleteCategory(id);

    return {
      success: true,
      message: 'Category deleted successfully',
    };
  });
