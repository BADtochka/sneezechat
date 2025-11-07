import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  nameColor: text(),
  createdAt: timestamp().defaultNow().notNull(),
});

export const messages = pgTable('messages', {
  id: uuid().primaryKey().defaultRandom(),
  author: uuid()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  text: text().notNull(),
  updatedAt: timestamp(),
  createdAt: timestamp().defaultNow().notNull(),
  deletedAt: timestamp(),
});

export const usersRelations = relations(users, ({ many }) => ({
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  author: one(users, {
    fields: [messages.author],
    references: [users.id],
  }),
}));
