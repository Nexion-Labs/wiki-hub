import { Elysia, t } from 'elysia';
import { authMiddleware } from '../middleware/auth';
import { wikiService } from '../services/wiki.service';
import {
  createWikiPageSchema,
  updateWikiPageSchema,
} from '../validators/wiki.validator';

export const wikiRoutes = new Elysia({ prefix: '/wiki' })
  .use(authMiddleware)
  .get('/pages', async ({ query }) => {
    const limit = parseInt(query.limit || '50');
    const offset = parseInt(query.offset || '0');
    const search = query.search;

    const pages = await wikiService.listPages(limit, offset, search);

    return {
      success: true,
      data: pages,
      meta: {
        limit,
        offset,
      },
    };
  })
  .post(
    '/pages',
    async ({ body, user, set }) => {
      if (!user) {
        throw new Error('Authentication required');
      }

      const validated = createWikiPageSchema.parse(body);
      const page = await wikiService.createPage(validated, user.userId);

      set.status = 201;
      return {
        success: true,
        message: 'Page created successfully',
        data: page,
      };
    },
    {
      body: t.Object({
        title: t.String(),
        contentMarkdown: t.String(),
        categoryIds: t.Optional(t.Array(t.String())),
        tagIds: t.Optional(t.Array(t.String())),
        isPublished: t.Optional(t.Boolean()),
      }),
    }
  )
  .get('/page/id/:id', async ({ params: { id } }) => {
    const page = await wikiService.getPageById(id);

    return {
      success: true,
      data: page,
    };
  })
  .get('/page/id/:id/versions', async ({ params: { id } }) => {
    const versions = await wikiService.getVersions(id);

    return {
      success: true,
      data: versions,
    };
  })
  .get('/page/id/:id/versions/:versionNumber', async ({ params }) => {
    const version = await wikiService.getVersion(
      params.id,
      parseInt(params.versionNumber)
    );

    return {
      success: true,
      data: version,
    };
  })
  .post('/page/id/:id/revert/:versionNumber', async ({ params, user }) => {
    if (!user) {
      throw new Error('Authentication required');
    }

    const page = await wikiService.revertToVersion(
      params.id,
      parseInt(params.versionNumber),
      user.userId
    );

    return {
      success: true,
      message: 'Page reverted successfully',
      data: page,
    };
  })
  .put(
    '/page/id/:id',
    async ({ params: { id }, body, user }) => {
      if (!user) {
        throw new Error('Authentication required');
      }

      const validated = updateWikiPageSchema.parse(body);
      const page = await wikiService.updatePage(
        id,
        validated,
        user.userId,
        user.role
      );

      return {
        success: true,
        message: 'Page updated successfully',
        data: page,
      };
    },
    {
      body: t.Object({
        title: t.Optional(t.String()),
        contentMarkdown: t.Optional(t.String()),
        categoryIds: t.Optional(t.Array(t.String())),
        tagIds: t.Optional(t.Array(t.String())),
        isPublished: t.Optional(t.Boolean()),
        changeSummary: t.Optional(t.String()),
      }),
    }
  )
  .delete('/page/id/:id', async ({ params: { id }, user }) => {
    if (!user) {
      throw new Error('Authentication required');
    }

    await wikiService.deletePage(id, user.userId, user.role);

    return {
      success: true,
      message: 'Page deleted successfully',
    };
  })
  .get('/page/slug/:slug', async ({ params: { slug } }) => {
    const page = await wikiService.getPage(slug);

    return {
      success: true,
      data: page,
    };
  });
