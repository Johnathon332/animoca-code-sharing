import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { index, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { usersToInvites } from "../../users/entities/usersToInvites.entity";

export const invites = pgTable('invite', {
  id: serial('id').primaryKey(),
  code: text('code').unique().notNull(),
  updatedDate: timestamp('update_date').defaultNow(),
  createdDate: timestamp('created_date').defaultNow()
}, (table) => ({
  codeIdx: index('code_idx').on(table.code)
}));

export const invitesRelations = relations(invites, ({ one }) => ({
  usersToInvites: one(usersToInvites)
}));


export type Invite = InferSelectModel<typeof invites>;
export type NewInvite = InferInsertModel<typeof invites>;