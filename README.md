# Blog Capstone — TanStack Start

Dự án blog hoàn chỉnh: TanStack Start + Tailwind v4 + shadcn/ui +
lucide-react + Neon + Drizzle + Better Auth.

## Bắt đầu

1. `SETUP.md` — dựng hạ tầng (Neon, Better Auth secret, shadcn CLI, Drizzle push)
2. `BLUEPRINT.md` — 25 TODO đánh số, bản đồ TODO ↔ kiến thức, checklist
3. Đối chiếu `solutions/` khi cần

## Về prompt thiết kế

Prompt "Taste Skill" để generate layout/token màu nằm ở tin nhắn trước
(không kèm trong project) — copy vào Codex/Claude riêng, sau khi có token
system, quay lại `SETUP.md` Bước 3 (`npx shadcn@latest init`) để áp dụng
màu đã chốt vào `src/styles/app.css`.

## Phạm vi MVP (đã chốt để tránh scope quá lớn)

Có: đăng ký/đăng nhập, CRUD bài viết (draft/published), trang danh sách +
chi tiết công khai, Markdown → HTML, SEO meta động theo bài viết, ownership
check (chỉ tác giả sửa/xoá bài của mình).

Chưa có (xem "Bài tập mở rộng" trong `BLUEPRINT.md`): tags/categories, mục
lục tự động, RSS feed, deploy Cloudflare Workers (làm khi web đã hoàn thiện
theo đúng ý bạn).
