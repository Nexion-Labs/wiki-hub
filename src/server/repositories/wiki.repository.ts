import { db } from '../db/client';
import {
  wikiPages,
  wikiVersions,
  categories,
  tags,
  wikiPageCategories,
  wikiPageTags,
} from '../db/schema';
import { eq, and, desc, sql, or, ilike } from 'drizzle-orm';
import type { NewWikiPage, NewWikiVersion, WikiPage } from '../db/schema';

export class WikiRepository {
  async create(data: NewWikiPage): Promise<WikiPage> {
    const [page] = await db.insert(wikiPages).values(data).returning();
    return page;
  }

  async findBySlug(slug: string) {
    const [page] = await db
      .select()
      .from(wikiPages)
      .where(and(eq(wikiPages.slug, slug), eq(wikiPages.isDeleted, false)))
      .limit(1);
    return page;
  }

  async findById(id: string) {
    const [page] = await db
      .select()
      .from(wikiPages)
      .where(eq(wikiPages.id, id))
      .limit(1);
    return page;
  }

  async findAll(limit = 50, offset = 0, searchQuery?: string) {
    let query = db
      .select()
      .from(wikiPages)
      .where(and(eq(wikiPages.isDeleted, false), eq(wikiPages.isPublished, true)));

    if (searchQuery) {
      query = query.where(
        or(
          ilike(wikiPages.title, `%${searchQuery}%`),
          ilike(wikiPages.content, `%${searchQuery}%`)
        )
      );
    }

    return await query
      .orderBy(desc(wikiPages.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async update(id: string, data: Partial<WikiPage>): Promise<WikiPage> {
    const [page] = await db
      .update(wikiPages)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(wikiPages.id, id))
      .returning();
    return page;
  }

  async delete(id: string): Promise<void> {
    await db
      .update(wikiPages)
      .set({ isDeleted: true, deletedAt: new Date() })
      .where(eq(wikiPages.id, id));
  }

  async incrementViewCount(id: string): Promise<void> {
    await db
      .update(wikiPages)
      .set({ viewCount: sql`${wikiPages.viewCount} + 1` })
      .where(eq(wikiPages.id, id));
  }

  // Version methods
  async createVersion(data: NewWikiVersion) {
    const [version] = await db.insert(wikiVersions).values(data).returning();
    return version;
  }

  async findVersions(pageId: string) {
    return await db
      .select()
      .from(wikiVersions)
      .where(eq(wikiVersions.pageId, pageId))
      .orderBy(desc(wikiVersions.versionNumber));
  }

  async findVersion(pageId: string, versionNumber: number) {
    const [version] = await db
      .select()
      .from(wikiVersions)
      .where(
        and(
          eq(wikiVersions.pageId, pageId),
          eq(wikiVersions.versionNumber, versionNumber)
        )
      )
      .limit(1);
    return version;
  }

  async getLatestVersionNumber(pageId: string): Promise<number> {
    const [result] = await db
      .select({ maxVersion: sql<number>`MAX(${wikiVersions.versionNumber})` })
      .from(wikiVersions)
      .where(eq(wikiVersions.pageId, pageId));

    return result?.maxVersion || 0;
  }

  // Category methods
  async addCategories(pageId: string, categoryIds: string[]): Promise<void> {
    if (categoryIds.length === 0) return;

    await db.insert(wikiPageCategories).values(
      categoryIds.map((categoryId) => ({ pageId, categoryId }))
    );
  }

  async removeCategories(pageId: string): Promise<void> {
    await db
      .delete(wikiPageCategories)
      .where(eq(wikiPageCategories.pageId, pageId));
  }

  // Tag methods
  async addTags(pageId: string, tagIds: string[]): Promise<void> {
    if (tagIds.length === 0) return;

    await db.insert(wikiPageTags).values(
      tagIds.map((tagId) => ({ pageId, tagId }))
    );

    // Increment usage count
    for (const tagId of tagIds) {
      await db
        .update(tags)
        .set({ usageCount: sql`${tags.usageCount} + 1` })
        .where(eq(tags.id, tagId));
    }
  }

  async removeTags(pageId: string): Promise<void> {
    // Get tag IDs before removing
    const pageTags = await db
      .select()
      .from(wikiPageTags)
      .where(eq(wikiPageTags.pageId, pageId));

    // Remove associations
    await db.delete(wikiPageTags).where(eq(wikiPageTags.pageId, pageId));

    // Decrement usage count
    for (const { tagId } of pageTags) {
      await db
        .update(tags)
        .set({ usageCount: sql`${tags.usageCount} - 1` })
        .where(eq(tags.id, tagId));
    }
  }
}

export const wikiRepository = new WikiRepository();
