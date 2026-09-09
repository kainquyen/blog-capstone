import { Menu } from "lucide-react";
import { useState } from "react";
import type { Post } from "./PostCard";
import { Link } from "@tanstack/react-router";
import { useTheme } from "./theme-provider";
import { EditorContent, useEditor } from "@tiptap/react";
import { tiptapExtensions } from "~/lib/tiptap/extensions";
import { TableOfContents } from "@tiptap/extension-table-of-contents";
import type { TableOfContentsStorage } from "@tiptap/extension-table-of-contents";

// --- Tiptap styles ---
import "~/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "~/components/tiptap-node/code-block-node/code-block-node.scss";
import "~/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "~/components/tiptap-node/list-node/list-node.scss";
import "~/components/tiptap-node/image-node/image-node.scss";
import "~/components/tiptap-node/heading-node/heading-node.scss";
import "~/components/tiptap-node/paragraph-node/paragraph-node.scss";
import "~/components/tiptap-templates/simple/simple-editor.scss";



export function PostLayout({
  post,
  onBack,
}: {
  post: Post;
  onBack?: () => void;
}) {
  const [tocOpen, setTocOpen] = useState(false);
  const [tocItems, setTocItems] = useState<TableOfContentsStorage["content"]>([]);

  const { theme } = useTheme();

  const editor = useEditor({
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap ProseMirror simple-editor",
      },
    },
    extensions: [
      ...tiptapExtensions,
      TableOfContents.configure({
        onUpdate: (items) => setTocItems(items),
      }),
    ],
    content: post.contentHtml,
  });

  return (
    <main className="w-full max-w-[1184px] mx-auto px-4 md:px-7 py-8 pb-24">
      <Link
        className="border-0 rounded-lg bg-transparent text-muted-foreground px-2 py-1.5 font-semibold text-sm hover:text-primary hover:bg-card cursor-pointer transition-colors"
        to="/"
      >
        ← Tất cả bài viết
      </Link>
      <header className="py-10 md:py-14">
        <div className="text-muted-foreground font-mono text-[11px] tracking-wide mb-2">
          {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}{" "}
          <span className="text-primary px-1">/</span> {post.topic}{" "}
          <span className="text-primary px-1">/</span> {post.readTime}
        </div>
        <h1 className="my-3 text-4xl md:text-6xl font-bold tracking-tight leading-none text-foreground">
          {post.title}
        </h1>
        <p className="text-muted-foreground text-xl leading-relaxed">
          {post.excerpt}
        </p>
      </header>

      <button
        className="flex md:hidden items-center gap-2 w-full mb-3 border border-border rounded-lg bg-card text-foreground px-3 py-2.5 font-bold text-sm cursor-pointer"
        onClick={() => setTocOpen(!tocOpen)}
        aria-expanded={tocOpen}
      >
        <Menu size={17} aria-hidden="true" /> Trong bài
      </button>
      {tocOpen && (
        <nav
          className="grid md:hidden gap-2 mb-6 p-3 border border-border rounded-xl bg-card text-sm font-semibold text-muted-foreground"
          aria-label="Mục lục"
        >
          {tocItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
              className="hover:text-primary transition-colors block"
            >
              {item.textContent}
            </a>
          ))}
        </nav>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-7 items-start">
        <article className="col-span-2 raw-post-content">
          <EditorContent editor={editor} />
        </article>

        <nav
          className="sticky top-24 hidden md:grid gap-2 py-3 pl-4 border-l border-border font-semibold text-sm text-muted-foreground"
          aria-label="Mục lục"
        >
          <p className="uppercase text-[11px] tracking-wider text-muted-foreground mb-2">
            Trong bài
          </p>
          {tocItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
              className="hover:text-primary transition-colors block"
            >
              {item.textContent}
            </a>
          ))}
        </nav>
      </div>
    </main>
  );
}
