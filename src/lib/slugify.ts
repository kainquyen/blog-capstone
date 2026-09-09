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
