import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

/**
 * ============================================================
 * TODO 9: Ôn lại trang "Rendering Markdown" vừa đọc.
 *
 * Viết hàm renderMarkdown(content) trả về chuỗi HTML, dùng pipeline:
 * remarkParse → remarkGfm → remarkRehype → rehypeStringify.
 *
 * (Bản rút gọn so với docs — bỏ rehypeSlug/rehypeAutolinkHeadings/
 * rehype-raw để đơn giản hoá, đủ dùng cho MVP blog. Đây là bài tập MỞ
 * RỘNG nếu bạn muốn thêm mục lục (TOC) tự động sau này.)
 *
 * Gợi ý:
 *
 * export async function renderMarkdown(content: string): Promise<string> {
 *   const result = await unified()
 *     .use(remarkParse)
 *     .use(remarkGfm)
 *     .use(remarkRehype)
 *     .use(rehypeStringify)
 *     .process(content)
 *   return String(result)
 * }
 * ============================================================
 */
export async function renderMarkdown(content: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(content)
  return String(result)
}
