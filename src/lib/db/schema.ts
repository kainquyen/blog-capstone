import { pgTable, text, timestamp, uuid, boolean, jsonb, primaryKey, index, date, integer } from 'drizzle-orm/pg-core'
import { user } from './auth-schema'

// ============================================================
// TODO 1: export * from './auth-schema' sau khi generate (SETUP.md Bước 4)
// ============================================================
export * from './auth-schema'

// ============================================================
// TODO 2: Định nghĩa bảng `posts`
// ============================================================

export const posts = pgTable('posts', {
    id: uuid('id').primaryKey().defaultRandom(),
    topic: text('topic').notNull(),
    readTime: text('read_time').notNull(),
    tags: text('tags').array().default([]),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    excerpt: text('excerpt'),
    content: jsonb('content').notNull(),       
    contentHtml: text('content_html'),          // HTML cache — dùng để render nhanh / SEO
    published: boolean('published').notNull().default(false),
    authorId: text('author_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const topics = pgTable('topics', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull().unique(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const bookmarks = pgTable('bookmarks', {
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    postId: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => [
    primaryKey({ columns: [t.userId, t.postId]}),
    index('bookmarks_post_id_idx').on(t.postId),
])

export const likes = pgTable('likes', {
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    postId: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => [
    primaryKey({ columns: [t.userId, t.postId]}),
    index('likes_post_id_idx').on(t.postId),
])

export const dailyAnalytics = pgTable("daily_analytics", {
  date: date("date").primaryKey(),
  desktop: integer("desktop").default(0).notNull(),
  mobile: integer("mobile").default(0).notNull(),
});