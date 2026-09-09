// ~/lib/tiptap/extensions.ts
//
// ⚠️ QUAN TRỌNG: mảng này PHẢI khớp (ít nhất là superset) với mảng
// extensions mà `SimpleEditor` (components/tiptap-templates/simple/
// simple-editor) đang dùng ở client. Nếu SimpleEditor có Highlight,
// TaskList, Image... mà mảng dưới đây thiếu, thì:
//   - JSON lưu vẫn ĐẦY ĐỦ (vì đó là output trực tiếp từ editor.getJSON())
//   - Nhưng contentHtml sinh ra ở server (generateHTML) sẽ THIẾU phần
//     format tương ứng, vì server không biết cách render node/mark đó.
//
// Cách làm chuẩn nhất: mở file simple-editor.tsx, copy đúng mảng
// extensions nó dùng cho useEditor({ extensions: [...] }), rồi import
// TỪ FILE NÀY ở cả 2 nơi (client + server) thay vì định nghĩa 2 lần.
//
// ✅ Đã đồng bộ với simple-editor.tsx (2026-08-27)

import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Typography } from "@tiptap/extension-typography";
import { Superscript } from "@tiptap/extension-superscript";
import { Subscript } from "@tiptap/extension-subscript";
import type { AnyExtension } from "@tiptap/core";

// HorizontalRule custom node của project (cùng extension với SimpleEditor)
import { HorizontalRule } from "~/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";

export const tiptapExtensions: AnyExtension[] = [
  StarterKit.configure({
    horizontalRule: false, // dùng HorizontalRule custom bên dưới
    link: {
      openOnClick: false,
      enableClickSelection: true,
    },
  }),
  HorizontalRule,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  TaskList,
  TaskItem.configure({ nested: true }),
  Highlight.configure({ multicolor: true }),
  Image,
  Typography,
  Superscript,
  Subscript,
  // 👉 thêm/bớt cho khớp đúng với SimpleEditor thật của bạn
];