import { pgTable, uuid, varchar, text, boolean, integer, timestamp, date, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { wikiPages } from './wiki';

export const eolProducts = pgTable('eol_products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  vendor: varchar('vendor', { length: 255 }),
  description: text('description'),
  categoryId: uuid('category_id').references(() => eolCategories.id),
  homepageUrl: varchar('homepage_url', { length: 500 }),
  documentationUrl: varchar('documentation_url', { length: 500 }),
  commandGuide: text('command_guide'),
  license: varchar('license', { length: 100 }),
  iconUrl: varchar('icon_url', { length: 500 }),
  isActive: boolean('is_active').notNull().default(true),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  slugIdx: index('idx_eol_products_slug').on(table.slug),
  categoryIdx: index('idx_eol_products_category').on(table.categoryId),
}));

export const eolVersions = pgTable('eol_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => eolProducts.id, { onDelete: 'cascade' }),
  versionNumber: varchar('version_number', { length: 100 }).notNull(),
  releaseDate: date('release_date'),
  eolDate: date('eol_date').notNull(),
  extendedSupportDate: date('extended_support_date'),
  lts: boolean('lts').notNull().default(false),
  lifecycleStage: varchar('lifecycle_stage', { length: 50 }).notNull(),
  notes: text('notes'),
  commandGuide: text('command_guide'),
  migrationGuidePageId: uuid('migration_guide_page_id').references(() => wikiPages.id),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  productIdx: index('idx_eol_versions_product').on(table.productId),
  eolDateIdx: index('idx_eol_versions_eol_date').on(table.eolDate),
  lifecycleIdx: index('idx_eol_versions_lifecycle').on(table.lifecycleStage),
}));

export const eolAlerts = pgTable('eol_alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  versionId: uuid('version_id').notNull().references(() => eolVersions.id, { onDelete: 'cascade' }),
  alertDaysBefore: integer('alert_days_before').notNull().default(90),
  isActive: boolean('is_active').notNull().default(true),
  lastNotifiedAt: timestamp('last_notified_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdx: index('idx_eol_alerts_user').on(table.userId),
  versionIdx: index('idx_eol_alerts_version').on(table.versionId),
}));

export const eolCategories = pgTable('eol_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 100 }).notNull().unique(), // e.g. 'programming-language'
  name: varchar('name', { length: 255 }).notNull(), // e.g. 'Ngôn ngữ lập trình'
  icon: varchar('icon', { length: 50 }).notNull(), // e.g. '💻'
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type EOLProduct = typeof eolProducts.$inferSelect;
export type NewEOLProduct = typeof eolProducts.$inferInsert;
export type EOLVersion = typeof eolVersions.$inferSelect;
export type NewEOLVersion = typeof eolVersions.$inferInsert;
export type EOLAlert = typeof eolAlerts.$inferSelect;
export type NewEOLAlert = typeof eolAlerts.$inferInsert;
export type EOLCategory = typeof eolCategories.$inferSelect;
export type NewEOLCategory = typeof eolCategories.$inferInsert;
