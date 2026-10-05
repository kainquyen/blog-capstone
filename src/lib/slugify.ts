import { like } from "drizzle-orm";
import { posts } from "./db/schema";

/** Converts a title string into a URL-safe slug.
 *  Pure/isomorphic — safe to call on both client and server.
 *  Example: "Học TanStack Start!" → "hoc-tanstack-start"
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, (m) => (m === "đ" ? "d" : "D"))
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function generateUniqueSlug(db: any, title: string) {
  let baseSlug = slugify(title);

  const existingPosts = await db
    .select({ slug: posts.slug })
    .from(posts)
    .where(like(posts.slug, `${baseSlug}%`));

  if (existingPosts.length === 0) return baseSlug;

  const existingSlugs = new Set(existingPosts.map((p: { slug: string }) => p.slug));

  if (!existingSlugs.has(baseSlug)) return baseSlug;

  let count = 1;
  while (existingSlugs.has(`${baseSlug}-${count}`)) {
    count++;
  }

  return `${baseSlug}-${count}`;
}
