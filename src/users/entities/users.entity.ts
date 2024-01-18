import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';
import { serial, text, pgTable, timestamp, integer, index } from 'drizzle-orm/pg-core';
import { usersToInvites } from './usersToInvites.entity';

export const users = pgTable('user', {
  id: serial('id').primaryKey(),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  updatedDate: timestamp('update_date').defaultNow(),
  createdDate: timestamp('created_date').defaultNow()
}, (table) => ({
  emailIdx: index('email_idx').on(table.email)
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  claimedBy: one(usersToInvites),
  belongsTo: many(usersToInvites)
}));

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;