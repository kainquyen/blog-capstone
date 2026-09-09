import { ArrowUpRight } from "lucide-react";
import { Badge } from "./ui/badge";
import { Link } from "@tanstack/react-router";
import { JSONContent } from "@tiptap/core";

export type Post = {
  id: string;
  createdAt?: string;
  topic: string;
  readTime: string;
  title: string;
  content: JSONContent;
  contentHtml: string;
  excerpt: string | null;
  authorId: string;
  slug: string;
  name: string | null;
  email: string | null;
  tags: string[] | null;
};

type PostCardProps = {
  post: Post;
  onOpen?: (post: Post) => void;
};

export function PostCard({ post, onOpen }: PostCardProps) {
  return (
    <article className="border-b border-border">
      <Link
        to="/posts/$slug"
        params={{ slug: post.slug }}
        className="w-full text-left py-7 px-0.5 bg-transparent text-foreground group cursor-pointer"
        aria-label={`Đọc bài ${post.title}`}
      >
        <div className="text-muted-foreground font-mono text-[11px] tracking-wide mb-2">
          {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-GB') : ''} <span className="text-primary px-1">/</span> {post.topic}{" "}
          <span className="text-primary px-1">/</span> {post.readTime}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(220px,0.55fr)_24px] gap-7 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight group-hover:text-primary transition-colors">
              {post.title}
            </h2>
            <p className="max-w-[570px] mt-2 mb-3 text-muted-foreground text-base">
              {post.excerpt}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {post.tags?.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div
            className="grid gap-1.5 font-mono text-xs pl-4 border-l-2 border-border"
            aria-label="Thay đổi trong mental model"
          >
            <span className="text-muted-foreground">{post.name}</span>
            <span className="text-primary font-medium">{post.email}</span>
          </div>
          <ArrowUpRight
            className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all hidden md:block"
            aria-hidden="true"
            strokeWidth={1.7}
          />
        </div>
      </Link>
    </article>
  );
}
