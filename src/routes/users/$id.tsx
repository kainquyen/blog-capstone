import { createFileRoute, Link } from "@tanstack/react-router";
import { getAuthorProfile } from "~/server/author-profile";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Calendar, FileText, Heart, Bookmark, ArrowUpRight, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/users/$id")({
  loader: async ({ params }) => {
    return await getAuthorProfile({ data: params.id });
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Tác giả: ${loaderData?.author.name ?? "Hồ sơ"}` },
      {
        name: "description",
        content: `Các bài viết chia sẻ kiến thức của ${loaderData?.author.name ?? "tác giả"}.`,
      },
    ],
  }),
  component: AuthorProfilePage,
});

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(-2)
      .join("")
      .toUpperCase() || "TG"
  );
}

function AuthorProfilePage() {
  const { author, stats, posts } = Route.useLoaderData();

  const joinedDate = author.createdAt
    ? new Date(author.createdAt).toLocaleDateString("vi-VN", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <main className="w-full max-w-[1024px] mx-auto px-4 md:px-7 py-8 pb-24">
      {/* Nút quay lại */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="size-4" /> Tất cả bài viết
      </Link>

      {/* Header Profile Tác giả */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-primary/5 via-card to-card p-6 md:p-8 mb-10 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar */}
          <Avatar className="size-20 md:size-24 ring-2 ring-primary/20 ring-offset-2 ring-offset-background shrink-0">
            <AvatarImage src={author.image ?? undefined} alt={author.name} />
            <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
              {getInitials(author.name)}
            </AvatarFallback>
          </Avatar>

          {/* Thông tin tác giả */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {author.name}
              </h1>
              <Badge variant="secondary" className="self-center sm:self-auto text-xs font-normal">
                {author.role === "admin" ? "Quản trị viên" : "Tác giả"}
              </Badge>
            </div>

            {joinedDate && (
              <p className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-muted-foreground font-mono">
                <Calendar className="size-3.5" />
                Tham gia từ {joinedDate}
              </p>
            )}

            {/* Chỉ số tác giả */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background/80 border border-border text-xs font-medium">
                <FileText className="size-3.5 text-primary" />
                <span className="font-semibold text-foreground">{stats.postsCount}</span>
                <span className="text-muted-foreground">bài viết</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background/80 border border-border text-xs font-medium">
                <Heart className="size-3.5 fill-rose-500/20 text-rose-500" />
                <span className="font-semibold text-foreground">{stats.likesCount}</span>
                <span className="text-muted-foreground">lượt thích</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background/80 border border-border text-xs font-medium">
                <Bookmark className="size-3.5 fill-amber-500/20 text-amber-500" />
                <span className="font-semibold text-foreground">{stats.bookmarksCount}</span>
                <span className="text-muted-foreground">lượt lưu</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Danh sách bài viết của tác giả */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Bài viết đã đăng
            <span className="text-sm font-normal text-muted-foreground">
              ({posts.length})
            </span>
          </h2>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-dashed border-border/80 text-muted-foreground text-sm">
            Tác giả này chưa xuất bản bài viết nào.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {posts.map((post) => (
              <article key={post.id} className="py-6 first:pt-2">
                <Link
                  to="/posts/$slug"
                  params={{ slug: post.slug }}
                  className="group block space-y-2.5"
                >
                  <div className="text-muted-foreground font-mono text-[11px] tracking-wide">
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleDateString("en-GB")
                      : ""}{" "}
                    <span className="text-primary px-1">/</span> {post.topic}{" "}
                    <span className="text-primary px-1">/</span> {post.readTime}
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <ArrowUpRight className="size-5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>

                  {post.excerpt && (
                    <p className="text-muted-foreground text-sm md:text-base leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs font-normal">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
