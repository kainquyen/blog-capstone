import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

/**
 * TODO 3: Ôn lại capstone trước — viết getDb(), đọc process.env.DATABASE_URL
 * BÊN TRONG hàm (không phải module scope).
 */
export function getDb() {
  const sql = neon(process.env.DATABASE_URL!)
  return drizzle(sql, {schema})
}
