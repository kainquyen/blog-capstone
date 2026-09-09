import { createFileRoute, notFound } from '@tanstack/react-router'
import { createServerFn } from "@tanstack/react-start";
import { getDb } from "~/lib/db/client";
import { posts, user } from "~/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { PostLayout } from "~/components/PostLayout";
import { authMiddleware } from '~/server/auth-middleware';

const getPostPreview = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((slug: string) => slug)
  .handler(async ({ data: slug, context }) => {
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
      .where(and(eq(posts.slug, slug), eq(posts.authorId, context.session.user.id)))

    if (!result ) throw notFound();

    return { post: result };
  });

export const Route = createFileRoute('/posts/preview/$slug')({
  loader: ({ params }) => getPostPreview({ data: params.slug }),
  component: RouteComponent,
})

function RouteComponent() {
  const { post } = Route.useLoaderData();

  return (
    <PostLayout post={post} />
  );
}
