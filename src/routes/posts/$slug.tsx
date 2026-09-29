import { createFileRoute } from "@tanstack/react-router";
import { getPostBySlug, isBookmarked } from "~/server/posts";
import { PostLayout } from "~/components/PostLayout";

export const Route = createFileRoute("/posts/$slug")({
  loader: async ({ params, context }) => {
    const { post } = await getPostBySlug({ data: params.slug });

    let bookmarked = false;
    if (context.session?.user?.id) {
      bookmarked = await isBookmarked({ data: post.id });
    }
    return { post, bookmarked };
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
  const { post, bookmarked }: { post: any; bookmarked: boolean } =
    Route.useLoaderData();

  return <PostLayout post={post} bookmarked={bookmarked} />;
}
