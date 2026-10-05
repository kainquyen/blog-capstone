import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { eq, desc, and, sql } from "drizzle-orm";
import { notFound } from "@tanstack/react-router";
import { getDb } from "~/lib/db/client";
import { user, posts, likes, bookmarks } from "~/lib/db/schema";

export interface AuthorProfileData {
  author: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string;
    createdAt: Date;
  };
  stats: {
    postsCount: number;
    likesCount: number;
    bookmarksCount: number;
  };
  posts: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    topic: string;
    readTime: string;
    tags: string[] | null;
    createdAt: Date;
  }>;
}

export const getAuthorProfile = createServerFn({ method: "GET" })
  .validator((id: string) => z.string().min(1).parse(id))
  .handler(async ({ data: authorId }): Promise<AuthorProfileData> => {
    const db = getDb();

    // 1. Lấy thông tin tác giả
    const [author] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.id, authorId))
      .limit(1);

    if (!author) {
      throw notFound();
    }

    // 2. Thống kê bài viết, likes, bookmarks
    const [postCountResult] = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(posts)
      .where(and(eq(posts.authorId, authorId), eq(posts.published, true)));

    const [likeCountResult] = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(likes)
      .innerJoin(posts, eq(likes.postId, posts.id))
      .where(and(eq(posts.authorId, authorId), eq(posts.published, true)));

    const [bookmarkCountResult] = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(bookmarks)
      .innerJoin(posts, eq(bookmarks.postId, posts.id))
      .where(and(eq(posts.authorId, authorId), eq(posts.published, true)));

    // 3. Danh sách các bài viết đã xuất bản của tác giả
    const authorPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        excerpt: posts.excerpt,
        topic: posts.topic,
        readTime: posts.readTime,
        tags: posts.tags,
        createdAt: posts.createdAt,
      })
      .from(posts)
      .where(and(eq(posts.authorId, authorId), eq(posts.published, true)))
      .orderBy(desc(posts.createdAt));

    return {
      author,
      stats: {
        postsCount: Number(postCountResult?.count ?? 0),
        likesCount: Number(likeCountResult?.count ?? 0),
        bookmarksCount: Number(bookmarkCountResult?.count ?? 0),
      },
      posts: authorPosts,
    };
  });
