import { pgTable, uuid, varchar, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './users';

export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  actionType: varchar('action_type', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 100 }).notNull(),
  entityId: uuid('entity_id'),
  metadata: jsonb('metadata'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdx: index('idx_activity_logs_user').on(table.userId),
  entityIdx: index('idx_activity_logs_entity').on(table.entityType, table.entityId),
  createdIdx: index('idx_activity_logs_created').on(table.createdAt),
}));

export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
