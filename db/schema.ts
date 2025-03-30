import { integer, pgTable, varchar, serial, text, json, timestamp } from "drizzle-orm/pg-core";

export const fileTable = pgTable("files", {
    id: serial('id').primaryKey(),
    file_name: varchar('file_name').notNull(),
    file_key: varchar('file_key').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  });

  export type FileModal = typeof fileTable.$inferSelect

  export const chatTable = pgTable('chats', {
    id: text('id').primaryKey(),
    userId: integer('user_id')
    .notNull()
    .references(() => userTable.id, { 
      onDelete: 'cascade' // 级联删除
    }), // 明确禁止 NULL // 新增用户关联
    messages: json('messages').notNull().default([]),
    createdAt: timestamp('created_at').defaultNow(),
    title: text("title").default('新对话'), // 默认标题
  });

  // 创建用户表
export const userTable = pgTable("users", {
  id: serial('id').primaryKey(),
  username: varchar('username').notNull().unique(),
  password: varchar('password').notNull(),  // 存储明文密码
  createdAt: timestamp('created_at').defaultNow(),
});

export type UserModal = typeof userTable.$inferSelect;


export const userPreferencesTable = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => userTable.id, { 
      onDelete: 'cascade' 
    }),
  preferredName: varchar("preferred_name", { length: 255 }).notNull(), // 用户偏好的称呼
  traits: json("traits").notNull().default([]), // 存储用户选择的特征，数组格式
  preferences: text("preferences").notNull().default(""), // 其他偏好信息
  createdAt: timestamp("created_at").defaultNow(),
});

export type UserPreferencesModal = typeof userPreferencesTable.$inferSelect;