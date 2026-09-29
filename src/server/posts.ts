import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import type { JSONContent } from "@tiptap/core";
import { generateHTML } from "@tiptap/html";
import { getDb } from "~/lib/db/client";
import { posts, topics, bookmark, user } from "~/lib/db/schema";
import { authMiddleware } from "~/server/auth-middleware";
import { tiptapExtensions } from "~/lib/tiptap/extensions";
import { slugify } from "~/lib/slugify";
import { notFound } from "@tanstack/react-router";

// Shared Zod schema for post fields (reused by createPost & updatePost)
const postFieldsSchema = z.object({
  title: z.string().min(1),
  excerpt: z.string().optional(),
  // z.any() is acceptable here — ProseMirror doc structure is complex to
  // fully validate; we do a minimal type check instead.
  content: z.any().refine((v) => v && v.type === "doc", {
    message: "content must be a valid Tiptap JSON doc",
  }),
  topic: z.string().min(1),
  readTime: z.string().min(1),
  tags: z.array(z.string()).optional(),
});

export const getTopics = createServerFn({ method: "GET" })
  .handler(async () => {
    const db = getDb();
    return db.select().from(topics);
  });
  
export const getTopicByName = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(z.string().min(1))
  .handler(async ({ data: name }) => {
    const db = getDb();
    const [topic] = await db
      .select()
      .from(topics)
      .where(eq(topics.name, name))
      .limit(1);
    return topic;
  });

export const getMyPosts = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = getDb();
    return db
      .select()
      .from(posts)
      .where(eq(posts.authorId, context.session.user.id))
      .orderBy(desc(posts.createdAt));
  });

export const getPost = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ data: id, context }) => {
    const db = getDb();
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);
    if (!post) throw new Error("Post not found");
    if (post.authorId !== context.session.user.id)
      throw new Error("Unauthorized");
    return post;
  });

export const createPost = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(postFieldsSchema)
  .handler(async ({ data, context }) => {
    const db = getDb();
    const { title, excerpt, content, topic, readTime, tags } = data;
    const html = generateHTML(content as JSONContent, tiptapExtensions);
    const [post] = await db
      .insert(posts)
      .values({
        title,
        excerpt,
        content: JSON.stringify(content),
        contentHtml: html,
        topic,
        readTime,
        tags,
        slug: slugify(title),
        authorId: context.session.user.id,
        published: false,
      })
      .returning();
    return post;
  });

export const updatePost = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(postFieldsSchema.extend({ id: z.string() }))
  .handler(async ({ data, context }) => {
    const db = getDb();
    const [existing] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, data.id))
      .limit(1);
    if (!existing) throw new Error("Post not found");
    if (existing.authorId !== context.session.user.id)
      throw new Error("Unauthorized");

    const html = generateHTML(data.content as JSONContent, tiptapExtensions);
    const [post] = await db
      .update(posts)
      .set({
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        contentHtml: html,
        topic: data.topic,
        readTime: data.readTime,
        tags: data.tags,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, data.id))
      .returning();
    return post;
  });

export const togglePublish = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ data: id, context }) => {
    const db = getDb();
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);
    if (!post) throw new Error("Post not found");
    if (post.authorId !== context.session.user.id)
      throw new Error("Unauthorized");
    await db
      .update(posts)
      .set({ published: !post.published })
      .where(eq(posts.id, id));
    return { success: true };
  });

export const deletePost = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ data: id, context }) => {
    const db = getDb();
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);
    if (!post) throw new Error("Post not found");
    if (post.authorId !== context.session.user.id)
      throw new Error("Unauthorized");
    await db.delete(posts).where(eq(posts.id, id));
    return { success: true };
  });


export const getPostBySlug = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const db = getDb();
    const [result] = await db
      .select({
        id: posts.id,
        topic: posts.topic,
        readTime: posts.readTime,
        tags: posts.tags,
        title: posts.title,
        slug: posts.slug,
        excerpt: posts.excerpt,
        contentHtml: posts.contentHtml,
        content: posts.content,
        published: posts.published,
        authorId: posts.authorId,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        name: user.name,
        email: user.email,
      })
      .from(posts)
      .leftJoin(user, eq(posts.authorId, user.id))
      .where(eq(posts.slug, slug));

    if (!result || !result.published) throw notFound();

    return { post: result };
  });

export const bookmarkPost = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ data: id, context }) => {
    const db = getDb();
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);
    if (!post) throw new Error("Post not found");
    const [existingBookmark] = await db
      .select()
      .from(bookmark)
      .where(
        and(
          eq(bookmark.userId, context.session.user.id),
          eq(bookmark.postId, id)
        )
      )
      .limit(1);

    if (existingBookmark) {
      await db
        .delete(bookmark)
        .where(
          and(
            eq(bookmark.userId, context.session.user.id),
            eq(bookmark.postId, id)
          )
        );
      return { success: true, bookmarked: false };
    } else {
      await db
        .insert(bookmark)
        .values({
          postId: id,
          userId: context.session.user.id,
        });
      return { success: true, bookmarked: true };
    }
  });

export const isBookmarked = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((postId: string) => postId)
  .handler(async ({ data: postId, context }) => {
    const db = getDb();
    const [existingBookmark] = await db
      .select()
      .from(bookmark)
      .where(
        and(
          eq(bookmark.userId, context.session.user.id),
          eq(bookmark.postId, postId)
        )
      )
      .limit(1);

    if (!existingBookmark) {
      return false;
    }
    return true;
  });
  