import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import type { InferSelectModel } from "drizzle-orm";
import type { JSONContent } from "@tiptap/core";
import {
  getMyPosts,
  getPost,
  createPost,
  updatePost,
  togglePublish,
  deletePost,
  getTopicByName,
} from "~/server/posts";
import { posts } from "~/lib/db/schema";

// Typed alias for a post row — jsonb columns (content) come back as `unknown`
// from Drizzle; we narrow them here so handlers can access fields safely.
type Post = Omit<InferSelectModel<typeof posts>, "content"> & {
  content: JSONContent;
};

interface PostFormState {
  id: string | null;
  title: string;
  excerpt: string;
  content: JSONContent | null;
  topic: string;
  readTime: string;
  tags: string[];
}

const defaultFormState: PostFormState = {
  id: null,
  title: "",
  excerpt: "",
  content: null,
  topic: "",
  readTime: "",
  tags: [],
};

export function usePostForm(initialPosts: Post[]) {
  const router = useRouter();

  const [postList, setPostList] = useState(initialPosts);
  const [form, setForm] = useState<PostFormState>(defaultFormState);
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function setField<K extends keyof PostFormState>(
    key: K,
    value: PostFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm() {
    setForm(defaultFormState);
    setIsEdit(false);
  }

  async function reload() {
    setPostList((await getMyPosts()) as unknown as Post[]);
    await router.invalidate();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.content) {
      setError("Vui lòng nhập nội dung bài viết");
      return;
    }
    try {
      await createPost({
        data: {
          title: form.title,
          excerpt: form.excerpt,
          content: form.content,
          topic: form.topic,
          readTime: form.readTime,
          tags: form.tags,
        },
      });
      setSuccessMessage("Đã tạo bài viết (dạng nháp)");
      resetForm();
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await updatePost({
        data: {
          id: form.id!,
          title: form.title,
          excerpt: form.excerpt,
          content: form.content,
          topic: form.topic,
          readTime: form.readTime,
          tags: form.tags,
        },
      });
      setSuccessMessage("Đã chỉnh sửa bài viết");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleEditLoad(id: string) {
    try {
      const post = (await getPost({ data: id })) as unknown as Post;
      setForm({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt ?? "",
        content: post.content,
        topic: post.topic,
        readTime: post.readTime,
        tags: post.tags ?? [],
      });
      setIsEdit(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleTogglePublish(id: string) {
    try {
      await togglePublish({ data: id });
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleDelete(id: string) {
    try {
      await deletePost({ data: id });
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  function handlePreview(slug: string) {
    router.navigate({
      to: "/posts/preview/$slug",
      params: { slug },
    });
  }

  return {
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
    handlePreview,
  };
}
