import { z } from "zod";

export const schema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  banned: z.boolean(),
  role: z.string(),
  banReason: z.string(),
  createdAt: z.date(),
});

export type User = z.infer<typeof schema>;
