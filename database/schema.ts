import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core"

export const user = sqliteTable("user", {
	id: integer("id").primaryKey(),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
})

export const message = sqliteTable("message", {
	id: integer("id").primaryKey(),
	userId: integer("user_id").notNull(),
	content: text("content").notNull(),
	sentAt: integer("sent_at", { mode: "timestamp" }).notNull(),
})
