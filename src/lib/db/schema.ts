import { relations } from 'drizzle-orm';
import { pgTable, serial, text, numeric, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users'; // Assuming you have a users schema

export const expenses = pgTable('expenses', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  category: text('category').notNull(),
  description: text('description'),
  date: timestamp('date').notNull().defaultNow(),
  userId: text('user_id').notNull() // Assuming you have user authentication
});

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id]
  })
})); 