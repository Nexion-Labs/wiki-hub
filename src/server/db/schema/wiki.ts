import { pgTable, uuid, varchar, text, boolean, integer, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { sql } from 'drizzle-orm';

export const wikiPages = pgTable('wiki_pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 500 }).notNull(),
  slug: varchar('slug', { length: 500 }).notNull().unique(),
  content: text('content').notNull(),
  contentMarkdown: text('content_markdown').notNull(),
  authorId: uuid('author_id').notNull().references(() => users.id),
  currentVersionId: uuid('current_version_id'),
  isPublished: boolean('is_published').notNull().default(false),
  isDeleted: boolean('is_deleted').notNull().default(false),
  viewCount: integer('view_count').notNull().default(0),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  publishedAt: timestamp('published_at'),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  slugIdx: index('idx_wiki_pages_slug').on(table.slug),
  authorIdx: index('idx_wiki_pages_author').on(table.authorId),
  publishedIdx: index('idx_wiki_pages_published').on(table.isPublished, table.isDeleted),
}));

export const wikiVersions = pgTable('wiki_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  pageId: uuid('page_id').notNull().references(() => wikiPages.id, { onDelete: 'cascade' }),
  versionNumber: integer('version_number').notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  content: text('content').notNull(),
  contentMarkdown: text('content_markdown').notNull(),
  editorId: uuid('editor_id').notNull().references(() => users.id),
  changeSummary: text('change_summary'),
  contentDiff: jsonb('content_diff'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  pageVersionIdx: index('idx_wiki_versions_page').on(table.pageId, table.versionNumber),
  editorIdx: index('idx_wiki_versions_editor').on(table.editorId),
}));

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  parentId: uuid('parent_id').references((): any => categories.id),
  color: varchar('color', { length: 7 }),
  icon: varchar('icon', { length: 50 }),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  parentIdx: index('idx_categories_parent').on(table.parentId),
  slugIdx: index('idx_categories_slug').on(table.slug),
}));

export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  usageCount: integer('usage_count').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  slugIdx: index('idx_tags_slug').on(table.slug),
  usageIdx: index('idx_tags_usage').on(table.usageCount),
}));

export const wikiPageCategories = pgTable('wiki_page_categories', {
  pageId: uuid('page_id').notNull().references(() => wikiPages.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  pageIdx: index('idx_wpc_page').on(table.pageId),
  categoryIdx: index('idx_wpc_category').on(table.categoryId),
}));

export const wikiPageTags = pgTable('wiki_page_tags', {
  pageId: uuid('page_id').notNull().references(() => wikiPages.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  pageIdx: index('idx_wpt_page').on(table.pageId),
  tagIdx: index('idx_wpt_tag').on(table.tagId),
}));

export type WikiPage = typeof wikiPages.$inferSelect;
export type NewWikiPage = typeof wikiPages.$inferInsert;
export type WikiVersion = typeof wikiVersions.$inferSelect;
export type NewWikiVersion = typeof wikiVersions.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
