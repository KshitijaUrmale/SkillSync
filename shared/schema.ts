import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  avatar: text("avatar"),
  bio: text("bio"),
  rating: integer("rating").default(0),
  exchangeCount: integer("exchange_count").default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  avatar: true,
  bio: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Skills Table
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'offering' or 'seeking'
  category: text("category").notNull(), // e.g., 'development', 'design', 'devops', 'data science'
  tags: text("tags").array().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSkillSchema = createInsertSchema(skills).pick({
  userId: true,
  title: true,
  description: true,
  type: true,
  category: true,
  tags: true,
});

export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Skill = typeof skills.$inferSelect;

// Exchanges Table
export const exchanges = pgTable("exchanges", {
  id: serial("id").primaryKey(),
  initiatorId: integer("initiator_id").notNull(),
  responderId: integer("responder_id").notNull(),
  initiatorSkillId: integer("initiator_skill_id").notNull(),
  responderSkillId: integer("responder_skill_id").notNull(),
  status: text("status").notNull(), // 'pending', 'accepted', 'rejected', 'completed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertExchangeSchema = createInsertSchema(exchanges).pick({
  initiatorId: true,
  responderId: true,
  initiatorSkillId: true,
  responderSkillId: true,
  status: true,
});

export type InsertExchange = z.infer<typeof insertExchangeSchema>;
export type Exchange = typeof exchanges.$inferSelect;

// Messages Table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  exchangeId: integer("exchange_id").notNull(),
  senderId: integer("sender_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  exchangeId: true,
  senderId: true,
  content: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
