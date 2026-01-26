import { Elysia, t } from 'elysia';
import { authMiddleware } from '../middleware/auth';
import { tagService } from '../services/tag.service';

export const tagRoutes = new Elysia({ prefix: '/tags' })
  .use(authMiddleware)
  .get('/', async () => {
    const tags = await tagService.listTags();

    return {
      success: true,
      data: tags,
    };
  })
  .get('/:slug', async ({ params: { slug } }) => {
    const tag = await tagService.getTag(slug);

    return {
      success: true,
      data: tag,
    };
  })
  .post(
    '/',
    async ({ body, user, set }) => {
      if (!user) {
        throw new Error('Authentication required');
      }

      const tag = await tagService.createTag(body.name);

      set.status = 201;
      return {
        success: true,
        message: 'Tag created successfully',
        data: tag,
      };
    },
    {
      body: t.Object({
        name: t.String(),
      }),
    }
  )
  .delete('/:id', async ({ params: { id }, user }) => {
    if (!user) {
      throw new Error('Authentication required');
    }

    await tagService.deleteTag(id);

    return {
      success: true,
      message: 'Tag deleted successfully',
    };
  });
