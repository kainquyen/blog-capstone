import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getDb } from "~/lib/db/client";
import { posts, user } from "~/lib/db/schema";
import { eq } from "drizzle-orm";
import { PostLayout } from "~/components/PostLayout";
/**
 * TODO 14: getPostBySlug — server function public, validator nhận slug
 * (string đơn giản), tìm post theo slug + published = true (không cho xem
 * draft qua URL công khai), throw notFound() nếu không có.
 */
const getPostBySlug = createServerFn({ method: "GET" })
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

export const Route = createFileRoute("/posts/$slug")({
  loader: ({ params }) => getPostBySlug({ data: params.slug }),

  /**
   * TODO 15: SEO động theo TỪNG bài viết — đây là điểm khác biệt quan
   * trọng nhất so với __root.tsx: head() ở route LÁ nhận được `loaderData`
   * làm tham số, cho phép bạn build meta tag DỰA TRÊN data vừa load (tiêu
   * đề, mô tả bài viết) — không phải meta tĩnh cố định.
   */
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.post.title },
      { name: "description", content: loaderData?.post.excerpt ?? "" },
      { property: "og:title", content: loaderData?.post.title },
      { property: "og:description", content: loaderData?.post.excerpt ?? "" },
      { property: "og:type", content: "article" },
    ],
  }),

  component: PostDetail,
});

function PostDetail() {
  const { post } = Route.useLoaderData();

  return (
    <PostLayout post={post} />
  );
}
