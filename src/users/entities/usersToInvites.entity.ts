import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';
import { serial, pgTable, integer } from 'drizzle-orm/pg-core';
import { invites } from '../../invites/entities/invites.entity';
import { users } from './users.entity';

export const usersToInvites = pgTable('user_invite', {
  id: serial('id').primaryKey(),
  belongsToUserId: integer('belongs_to_user_id').references(() => users.id).notNull(),
  inviteId: integer('invite_id').references(() => invites.id).notNull(),
  claimedById: integer('claimed_by_id').references(() => users.id)
});

export const belongsTo = relations(usersToInvites, ({ one }) => ({
  users: one(users, {
    fields: [usersToInvites.belongsToUserId],
    references: [users.id],
  }),
}));

export const claimedBy = relations(usersToInvites, ({ one }) => ({
  users: one(users, {
    fields: [usersToInvites.claimedById],
    references: [users.id],
  })
}));

export const invite = relations(usersToInvites, ({one}) => ({
  invites: one(invites, {
    fields: [usersToInvites.inviteId],
    references: [invites.id],
  }),
}));

export type UsersToInvites = InferSelectModel<typeof usersToInvites>;
export type NewUsersToInvites = InferInsertModel<typeof usersToInvites>;