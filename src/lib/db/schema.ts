import { pgTable, text, timestamp, uuid, boolean, jsonb } from 'drizzle-orm/pg-core'

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
    content: jsonb('content').notNull(),       // JSON gốc — nguồn sự thật, dùng để edit lại
    contentHtml: text('content_html'),          // HTML cache — dùng để render nhanh / SEO
    published: boolean('published').notNull().default(false),
    authorId: text('author_id').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const tags = pgTable('tags', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull().unique(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const postsToTags = pgTable('posts_to_tags', {
    postId: uuid('post_id').notNull().references(() => posts.id),
    tagId: uuid('tag_id').notNull().references(() => tags.id),
})

export const topics = pgTable('topics', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull().unique(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})