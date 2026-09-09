import { createFileRoute, ErrorComponent, Link } from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import type { InferSelectModel } from "drizzle-orm";
import type { JSONContent } from "@tiptap/core";
import { Trash2, Eye, EyeOff, Pen, MoveUpRight } from "lucide-react";
import { SimpleEditor } from "~/components/tiptap-templates/simple/simple-editor";
import { posts } from "~/lib/db/schema";
import { getMyPosts, getTopics } from "~/server/posts";
import { usePostForm } from "~/hooks/use-post-form";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

type Post = Omit<InferSelectModel<typeof posts>, "content"> & {
  content: JSONContent;
};

function AdminError({ error, reset }: ErrorComponentProps) {
  return (
    <div className="border border-red-300 rounded p-4">
      <ErrorComponent error={error} />
      <button className="mt-2 underline" onClick={() => reset()}>
        Thử lại
      </button>
    </div>
  );
}

export const Route = createFileRoute("/_authed/admin/posts")({
  loader: async () => {
    const [posts, topics] = await Promise.all([getMyPosts(), getTopics()]);
    return { posts, topics };
  },
  component: AdminPostsPage,
  errorComponent: AdminError,
});

// ---------------------------------------------------------------------------

function AdminPostsPage() {
  const { posts, topics } = Route.useLoaderData();

  const initialPosts = posts as unknown as Post[];
  const {
    postList,
    form,
    setField,
    isEdit,
    error,
    successMessage,
    handleCreate,
    handleUpdate,
    handleEditLoad,
    handleTogglePublish,
    handleDelete,
    handlePreview
  } = usePostForm(initialPosts);

  return (
    <div className="space-y-8 w-full max-w-[1184px] mx-auto px-4 md:px-7 flex-1 mt-20">
      <h1 className="text-2xl font-bold">Quản lý bài viết của tôi</h1>

      {successMessage && <p className="text-green-600">{successMessage}</p>}
      {error && <p className="text-red-600">{error}</p>}

      <ul className="space-y-3">
        {postList.map((p) => (
          <li
            key={p.id}
            className="border rounded p-3 flex items-center justify-between"
          >
            <div>
              <p className="font-medium">{p.title}</p>
              <p className="text-xs text-gray-500">
                {p.published ? "Đã đăng" : "Bản nháp"} · /posts/{p.slug}
              </p>
            </div>
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="outline"
                    className="cursor-pointer rounded px-2 py-1 text-sm"
                    onClick={() => handleEditLoad(p.id)}
                  >
                    <Pen size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Sửa bài viết</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="outline"
                    className="cursor-pointer rounded px-2 py-1 text-sm"
                    onClick={() => handleTogglePublish(p.id)}
                  >
                    {p.published ? <EyeOff size={14} /> : <Eye size={14} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {p.published ? "Ẩn bài viết" : "Đăng bài viết"}
                </TooltipContent>
              </Tooltip>
              {!p.published && (
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant="outline"
                      className="cursor-pointer rounded px-2 py-1 text-sm"
                      onClick={() => handlePreview(p.slug)}
                    >
                      <MoveUpRight size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Xem trước bài viết</TooltipContent>
                </Tooltip>
              )}

              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="outline"
                    className="cursor-pointer rounded px-2 py-1 text-sm"
                    onClick={() => handleDelete(p.id)}
                  >
                    <Trash2 size={14} color="red" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Xoá bài viết</TooltipContent>
              </Tooltip>
            </div>
          </li>
        ))}
      </ul>

      <form
        onSubmit={isEdit ? handleUpdate : handleCreate}
        className="space-y-3 border-t py-6"
      >
        <h2 className="font-semibold">
          {isEdit ? `Chỉnh sửa: ${form.title}` : "Tạo bài viết"}
        </h2>
        <Input
          className="w-full border rounded px-3 py-2"
          placeholder="Tiêu đề"
          value={form.title}
          onChange={(e) => setField("title", e.target.value)}
        />
        <Input
          className="w-full border rounded px-3 py-2"
          placeholder="Tóm tắt (tuỳ chọn)"
          value={form.excerpt}
          onChange={(e) => setField("excerpt", e.target.value)}
        />

        <Select
          value={form.topic}
          onValueChange={(val) => setField("topic", val as string)}
        >
          <SelectTrigger className="w-full border rounded">
            <SelectValue placeholder="Chọn topic" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {topics.map((t) => (
                <SelectItem key={t.id} value={t.name}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Input
          className="w-full border rounded px-3 py-2"
          placeholder="Thời gian đọc"
          value={form.readTime}
          onChange={(e) => setField("readTime", e.target.value)}
        />
        <Input
          className="w-full border rounded px-3 py-2"
          placeholder="Tags (cách nhau bởi dấu phẩy)"
          value={form.tags.join(", ")}
          onChange={(e) =>
            setField(
              "tags",
              e.target.value.split(",").map((t) => t.trim()),
            )
          }
        />
        <SimpleEditor
          content={form.content ?? undefined}
          onChange={(json: JSONContent) => setField("content", json)}
        />
        <Button
          type="submit"
          variant="outline"
          className="cursor-pointer text-md py-5 px-4 rounded"
        >
          {isEdit ? "Lưu chỉnh sửa" : "Lưu nháp"}
        </Button>
      </form>
    </div>
  );
}
