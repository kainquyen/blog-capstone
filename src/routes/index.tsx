import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getDb } from "~/lib/db/client";
import { posts, user } from "~/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { PostCard, type Post } from "~/components/PostCard";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import { getTopics } from "~/server/posts";
/**
 * TODO 13: getPublishedPosts — server function CÔNG KHAI, KHÔNG cần
 * authMiddleware (ai cũng xem được blog). Query: select posts, where
 * published = true, orderBy createdAt desc.
 */
const getPublishedPosts = createServerFn({ method: "GET" }).handler(
  async () => {
    const db = getDb();
    const results = await db
      .select({
        id: posts.id,
        topic: posts.topic,
        readTime: posts.readTime,
        tags: posts.tags,
        title: posts.title,
        slug: posts.slug,
        excerpt: posts.excerpt,
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
      .where(eq(posts.published, true))
      .orderBy(desc(posts.createdAt));

    return results;
  },
);

export const Route = createFileRoute("/")({
  loader: async () => {
    const [posts, topics] = await Promise.all([getPublishedPosts(), getTopics()]);
    return { posts, topics };
  },
  component: Home,
});

function Home() {
  const { posts, topics } = Route.useLoaderData();
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("Tất cả");

  const tags = ["Tất cả", ...topics.map((t) => t.name)];
  const filteredPosts = useMemo(
    () =>
      posts.filter((post) => {
        const matchedTag = activeTag === "Tất cả" || post.topic === activeTag;
        const searchable =
          `${post.title} ${post.excerpt} ${(post.tags || []).join(",")}`.toLocaleLowerCase();
        return matchedTag && searchable.includes(query.toLocaleLowerCase());
      }),
    [activeTag, query, posts],
  );

  return (
    <div className="min-h-screen overflow-x-hidden flex flex-col">
      <main
        className="w-full max-w-[1184px] mx-auto px-4 md:px-7 flex-1"
        id="notes"
      >
        <section className="grid grid-cols-1 md:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)] gap-9 md:gap-18 items-end pt-14 pb-10 md:pt-24 md:pb-16">
          <div>
            <p className="m-0 mb-3 text-primary font-mono text-xs font-semibold tracking-wider uppercase">
              Nhật ký học full-stack
            </p>
            <h1 className="m-0 font-bold tracking-tight text-foreground text-4xl sm:text-5xl md:text-6xl leading-[0.98]">
              Những lần mô hình tư duy được sửa lại.
            </h1>
          </div>
          <p className="max-w-[390px] mb-1 text-muted-foreground text-lg leading-relaxed">
            Ghi lại việc học TanStack Start, React và TypeScript, với code là
            một phần của lời giải thích.
          </p>
        </section>
        <div className="grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] gap-8 md:gap-14">
          <aside className="self-start md:sticky top-7 grid gap-2 py-4">
            <div className="mb-2">
              <label className="relative flex items-center text-muted-foreground">
                <Search
                  size={16}
                  aria-hidden="true"
                  className="absolute left-3 pointer-events-none"
                />
                <span className="sr-only">Tìm bài viết</span>
                <Input
                  className="pl-9"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm bài viết"
                />
              </label>
            </div>
            <p className="m-0 mb-1 text-muted-foreground font-mono text-[11px] tracking-wider uppercase">
              Chủ đề
            </p>
            <div className="flex md:flex-col overflow-x-auto gap-1">
              {tags.map((tag) => (
                <button
                  key={tag}
                  className={`w-max md:w-full border-0 rounded-lg px-3 py-1.5 text-left text-sm font-semibold transition-all cursor-pointer ${
                    activeTag === tag
                      ? "bg-card text-foreground shadow-sm font-bold"
                      : "bg-transparent text-muted-foreground hover:bg-card/50 hover:text-foreground"
                  }`}
                  onClick={() => {
                    setActiveTag(tag)
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </aside>
          <section
            className="border-t border-border"
            aria-label="Danh sách bài viết"
          >
            {filteredPosts.length ? (
              filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <div className="py-16 text-center">
                <h2 className="text-2xl font-bold text-foreground">
                  Chưa có bài phù hợp
                </h2>
                <p className="text-muted-foreground mt-2">
                  Thử một từ khóa hoặc chủ đề khác.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
      <footer
        className="flex justify-between items-center max-w-[1240px] w-full mx-auto px-7 py-7 mt-12 border-t border-border text-muted-foreground font-mono text-xs"
        id="about"
      >
        <span>/kai-learns</span>
      </footer>
    </div>
  );
}
