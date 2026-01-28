import { createServerFn } from '@tanstack/react-start';
import { WikiService } from '../services/wiki.service';

const wikiService = new WikiService();

// List all wiki pages
export const listWikiPages = createServerFn({ method: 'GET' })
  .inputValidator((data: { limit?: number; offset?: number; searchQuery?: string }) => data)
  .handler(async ({ data }) => {
    try {
      const pages = await wikiService.listPages(data.limit || 50, data.offset || 0, data.searchQuery);
      return { success: true, data: pages };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to list pages';
      return { success: false, error: message, data: null };
    }
  });

// Get page by slug
export const getWikiPageBySlug = createServerFn({ method: 'GET' })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    try {
      const page = await wikiService.getPage(data.slug);
      return { success: true, data: page };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Page not found';
      return { success: false, error: message, data: null };
    }
  });

// Get page by ID
export const getWikiPageById = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    try {
      const page = await wikiService.getPageById(data.id);
      return { success: true, data: page };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Page not found';
      return { success: false, error: message, data: null };
    }
  });

// Create page
export const createWikiPageFn = createServerFn({ method: 'POST' })
  .inputValidator((data: {
    title: string;
    contentMarkdown: string;
    isPublished?: boolean;
    categoryIds?: string[];
    tagIds?: string[];
    authorId: string;
  }) => data)
  .handler(async ({ data }) => {
    try {
      const { authorId, ...pageData } = data;
      const page = await wikiService.createPage({
        title: pageData.title,
        contentMarkdown: pageData.contentMarkdown,
        isPublished: pageData.isPublished ?? false,
        categoryIds: pageData.categoryIds ?? [],
        tagIds: pageData.tagIds ?? [],
      }, authorId);
      return { success: true, data: page };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create page';
      return { success: false, error: message, data: null };
    }
  });

// Update page
export const updateWikiPageFn = createServerFn({ method: 'POST' })
  .inputValidator((data: {
    id: string;
    title?: string;
    contentMarkdown?: string;
    isPublished?: boolean;
    categoryIds?: string[];
    tagIds?: string[];
    editorId: string;
    userRole: string;
    changeSummary?: string;
  }) => data)
  .handler(async ({ data }) => {
    try {
      const { id, editorId, userRole, ...pageData } = data;
      const page = await wikiService.updatePage(id, pageData, editorId, userRole);
      return { success: true, data: page };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update page';
      return { success: false, error: message, data: null };
    }
  });

// Delete page
export const deleteWikiPageFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string; userId: string; userRole: string }) => data)
  .handler(async ({ data }) => {
    try {
      await wikiService.deletePage(data.id, data.userId, data.userRole);
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete page';
      return { success: false, error: message };
    }
  });

// Get page versions
export const getWikiPageVersions = createServerFn({ method: 'GET' })
  .inputValidator((data: { pageId: string }) => data)
  .handler(async ({ data }) => {
    try {
      const versions = await wikiService.getVersions(data.pageId);
      return { success: true, data: versions };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get versions';
      return { success: false, error: message, data: null };
    }
  });

// Revert to version
export const revertToVersionFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { pageId: string; versionNumber: number; userId: string }) => data)
  .handler(async ({ data }) => {
    try {
      const page = await wikiService.revertToVersion(data.pageId, data.versionNumber, data.userId);
      return { success: true, data: page };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to revert version';
      return { success: false, error: message, data: null };
    }
  });
