import { createFileRoute } from "@tanstack/react-router";
import { getPostBySlug } from "~/server/posts";
import { PostLayout } from "~/components/PostLayout";

export const Route = createFileRoute("/posts/$slug")({
  loader: async ({ params, context }) => {
    const { post } = await getPostBySlug({
      data: {
        slug: params.slug,
        userId: context.session?.user.id,
      },
    });

    return {
      post,
    };
  },
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
  const { post }: { post: any } = Route.useLoaderData();

  return <PostLayout post={post} />;
}
