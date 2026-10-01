import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { eq, asc, or } from "drizzle-orm";
import { getDb } from "~/lib/db/client";
import { comments, user } from "~/lib/db/schema";
import { authMiddleware } from "~/server/auth-middleware";

export interface CommentAuthor {
  id: string;
  name: string;
  image: string | null;
  email: string;
  role: string;
}

export interface CommentItem {
  id: string;
  postId: string;
  authorId: string;
  parentId: string | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author: CommentAuthor;
}

export const getComments = createServerFn({ method: "GET" })
  .validator((postId: string) => z.string().uuid().parse(postId))
  .handler(async ({ data: postId }): Promise<CommentItem[]> => {
    const db = getDb();

    const rows = await db
      .select({
        id: comments.id,
        postId: comments.postId,
        authorId: comments.authorId,
        parentId: comments.parentId,
        content: comments.content,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        authorIdUser: user.id,
        authorName: user.name,
        authorImage: user.image,
        authorEmail: user.email,
        authorRole: user.role,
      })
      .from(comments)
      .innerJoin(user, eq(comments.authorId, user.id))
      .where(eq(comments.postId, postId))
      .orderBy(asc(comments.createdAt));

    return rows.map((r) => ({
      id: r.id,
      postId: r.postId,
      authorId: r.authorId,
      parentId: r.parentId,
      content: r.content,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      author: {
        id: r.authorIdUser,
        name: r.authorName,
        image: r.authorImage,
        email: r.authorEmail,
        role: r.authorRole,
      },
    }));
  });

export const createComment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { postId: string; content: string; parentId?: string | null }) =>
    z
      .object({
        postId: z.string().uuid(),
        content: z
          .string()
          .trim()
          .min(1, "Nội dung bình luận không được để trống")
          .max(2000, "Bình luận tối đa 2000 ký tự"),
        parentId: z.string().uuid().nullish(),
      })
      .parse(data)
  )
  .handler(async ({ data, context }): Promise<CommentItem> => {
    const db = getDb();
    const currentUser = context.session.user;

    const [newComment] = await db
      .insert(comments)
      .values({
        postId: data.postId,
        authorId: currentUser.id,
        content: data.content,
        parentId: data.parentId ?? null,
      })
      .returning();

    return {
      id: newComment.id,
      postId: newComment.postId,
      authorId: newComment.authorId,
      parentId: newComment.parentId,
      content: newComment.content,
      createdAt: newComment.createdAt,
      updatedAt: newComment.updatedAt,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        image: currentUser.image ?? null,
        email: currentUser.email,
        role: currentUser.role,
      },
    };
  });

export const deleteComment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((commentId: string) => z.string().uuid().parse(commentId))
  .handler(async ({ data: commentId, context }) => {
    const db = getDb();
    const userId = context.session.user.id;
    const userRole = context.session.user.role;

    const [existing] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1);

    if (!existing) {
      throw new Error("Bình luận không tồn tại");
    }

    if (existing.authorId !== userId && userRole !== "admin") {
      throw new Error("Bạn không có quyền xoá bình luận này");
    }

    // Xóa comment này và các reply con trực tiếp của nó
    await db
      .delete(comments)
      .where(or(eq(comments.id, commentId), eq(comments.parentId, commentId)));

    return { success: true };
  });
