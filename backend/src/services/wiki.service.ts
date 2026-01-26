import { wikiRepository } from '../repositories/wiki.repository';
import { generateSlug, generateUniqueSlug } from '../utils/slug';
import { markdownToHtml, sanitizeMarkdown } from '../utils/markdown';
import { calculateDiff } from '../utils/diff';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import type {
  CreateWikiPageInput,
  UpdateWikiPageInput,
} from '../validators/wiki.validator';

export class WikiService {
  async createPage(data: CreateWikiPageInput, authorId: string) {
    // Generate slug from title
    const baseSlug = generateSlug(data.title);

    // Check if slug exists
    const existingPages = await wikiRepository.findAll(1000);
    const existingSlugs = existingPages.map((p) => p.slug);
    const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);

    // Sanitize and convert markdown
    const sanitizedMarkdown = sanitizeMarkdown(data.contentMarkdown);
    const htmlContent = markdownToHtml(sanitizedMarkdown);

    // Create page
    const page = await wikiRepository.create({
      title: data.title,
      slug: uniqueSlug,
      content: htmlContent,
      contentMarkdown: sanitizedMarkdown,
      authorId,
      isPublished: data.isPublished || false,
      isDeleted: false,
      viewCount: 0,
    });

    // Create initial version
    await wikiRepository.createVersion({
      pageId: page.id,
      versionNumber: 1,
      title: page.title,
      content: htmlContent,
      contentMarkdown: sanitizedMarkdown,
      editorId: authorId,
      changeSummary: 'Initial version',
    });

    // Add categories and tags
    if (data.categoryIds && data.categoryIds.length > 0) {
      await wikiRepository.addCategories(page.id, data.categoryIds);
    }

    if (data.tagIds && data.tagIds.length > 0) {
      await wikiRepository.addTags(page.id, data.tagIds);
    }

    return page;
  }

  async updatePage(
    id: string,
    data: UpdateWikiPageInput,
    editorId: string,
    userRole: string
  ) {
    const page = await wikiRepository.findById(id);
    if (!page) {
      throw new NotFoundError('Page not found');
    }

    // Check ownership for contributors
    if (userRole === 'contributor' && page.authorId !== editorId) {
      throw new ForbiddenError('You can only edit your own pages');
    }

    const updateData: Partial<typeof page> = {};

    // Update title and slug if changed
    if (data.title && data.title !== page.title) {
      updateData.title = data.title;
      const baseSlug = generateSlug(data.title);
      const existingPages = await wikiRepository.findAll(1000);
      const existingSlugs = existingPages
        .filter((p) => p.id !== id)
        .map((p) => p.slug);
      updateData.slug = generateUniqueSlug(baseSlug, existingSlugs);
    }

    // Update content if changed
    if (data.contentMarkdown && data.contentMarkdown !== page.contentMarkdown) {
      const sanitizedMarkdown = sanitizeMarkdown(data.contentMarkdown);
      const htmlContent = markdownToHtml(sanitizedMarkdown);

      updateData.content = htmlContent;
      updateData.contentMarkdown = sanitizedMarkdown;

      // Create new version
      const latestVersion = await wikiRepository.getLatestVersionNumber(id);
      const diff = calculateDiff(page.contentMarkdown, sanitizedMarkdown);

      await wikiRepository.createVersion({
        pageId: id,
        versionNumber: latestVersion + 1,
        title: updateData.title || page.title,
        content: htmlContent,
        contentMarkdown: sanitizedMarkdown,
        editorId,
        changeSummary: data.changeSummary || 'Updated content',
        contentDiff: diff,
      });
    }

    if (data.isPublished !== undefined) {
      updateData.isPublished = data.isPublished;
      if (data.isPublished) {
        updateData.publishedAt = new Date();
      }
    }

    // Update categories if provided
    if (data.categoryIds) {
      await wikiRepository.removeCategories(id);
      if (data.categoryIds.length > 0) {
        await wikiRepository.addCategories(id, data.categoryIds);
      }
    }

    // Update tags if provided
    if (data.tagIds) {
      await wikiRepository.removeTags(id);
      if (data.tagIds.length > 0) {
        await wikiRepository.addTags(id, data.tagIds);
      }
    }

    // Update page
    const updatedPage = await wikiRepository.update(id, updateData);
    return updatedPage;
  }

  async getPage(slug: string) {
    const page = await wikiRepository.findBySlug(slug);
    if (!page) {
      throw new NotFoundError('Page not found');
    }

    // Increment view count
    await wikiRepository.incrementViewCount(page.id);

    return page;
  }

  async getPageById(id: string) {
    const page = await wikiRepository.findById(id);
    if (!page) {
      throw new NotFoundError('Page not found');
    }
    return page;
  }

  async listPages(limit = 50, offset = 0, searchQuery?: string) {
    return await wikiRepository.findAll(limit, offset, searchQuery);
  }

  async deletePage(id: string, userId: string, userRole: string) {
    const page = await wikiRepository.findById(id);
    if (!page) {
      throw new NotFoundError('Page not found');
    }

    // Check ownership for contributors
    if (userRole === 'contributor' && page.authorId !== userId) {
      throw new ForbiddenError('You can only delete your own pages');
    }

    await wikiRepository.delete(id);
  }

  async getVersions(pageId: string) {
    return await wikiRepository.findVersions(pageId);
  }

  async getVersion(pageId: string, versionNumber: number) {
    const version = await wikiRepository.findVersion(pageId, versionNumber);
    if (!version) {
      throw new NotFoundError('Version not found');
    }
    return version;
  }

  async revertToVersion(
    pageId: string,
    versionNumber: number,
    userId: string
  ) {
    const version = await wikiRepository.findVersion(pageId, versionNumber);
    if (!version) {
      throw new NotFoundError('Version not found');
    }

    const page = await wikiRepository.findById(pageId);
    if (!page) {
      throw new NotFoundError('Page not found');
    }

    // Update page with version content
    const updatedPage = await wikiRepository.update(pageId, {
      title: version.title,
      content: version.content,
      contentMarkdown: version.contentMarkdown,
    });

    // Create new version for the revert
    const latestVersion = await wikiRepository.getLatestVersionNumber(pageId);
    await wikiRepository.createVersion({
      pageId,
      versionNumber: latestVersion + 1,
      title: version.title,
      content: version.content,
      contentMarkdown: version.contentMarkdown,
      editorId: userId,
      changeSummary: `Reverted to version ${versionNumber}`,
    });

    return updatedPage;
  }
}

export const wikiService = new WikiService();
