import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import type { JSONContent } from "@tiptap/core";
import { generateHTML } from "@tiptap/html";
import { getDb } from "~/lib/db/client";
import { posts, topics } from "~/lib/db/schema";
import { authMiddleware } from "~/server/auth-middleware";
import { tiptapExtensions } from "~/lib/tiptap/extensions";
import { slugify } from "~/lib/slugify";

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
