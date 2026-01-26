import { pgTable, uuid, varchar, text, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: text('description'),
  permissions: jsonb('permissions').notNull().$type<{
    wiki: string[];
    eol: string[];
    users: string[];
  }>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
