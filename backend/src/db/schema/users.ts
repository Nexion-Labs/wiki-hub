import { pgTable, uuid, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';
import { roles } from './roles';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 255 }),
  roleId: uuid('role_id').notNull().references(() => roles.id),
  isActive: boolean('is_active').notNull().default(true),
  emailVerified: boolean('email_verified').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  lastLogin: timestamp('last_login'),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
