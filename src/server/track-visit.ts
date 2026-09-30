// server/functions/track-visit.ts
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { UAParser } from "ua-parser-js";
import { getDb } from "~/lib/db/client";
import { dailyAnalytics } from "~/lib/db/schema";
import { sql, asc, lte } from "drizzle-orm";

export const trackVisit = createServerFn({ method: "POST" }).handler(
  async () => {
    const request = getRequest();
    const userAgent = request?.headers.get("user-agent") || "";

    // Parse User-Agent để phân biệt Mobile/Desktop
    const parser = new UAParser(userAgent);
    const deviceType = parser.getDevice().type;
    const isMobile = deviceType === "mobile" || deviceType === "tablet";
    const db = getDb();

    // Lấy ngày hiện tại dạng YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0];
    const oldestDay = new Date(today);
    oldestDay.setDate(
      oldestDay.getDate() - Number(import.meta.env.VITE_OLDEST_DAY)
    );
    const oldestDayStr = oldestDay.toISOString().split("T")[0];
    await db
      .delete(dailyAnalytics)
      .where(lte(dailyAnalytics.date, oldestDayStr));

    // UPSERT Drizzle
    await db
      .insert(dailyAnalytics)
      .values({
        date: today,
        desktop: isMobile ? 0 : 1,
        mobile: isMobile ? 1 : 0,
      })
      .onConflictDoUpdate({
        target: dailyAnalytics.date,
        set: {
          desktop: isMobile
            ? dailyAnalytics.desktop
            : sql`${dailyAnalytics.desktop} + 1`,
          mobile: isMobile
            ? sql`${dailyAnalytics.mobile} + 1`
            : dailyAnalytics.mobile,
        },
      });

    return { success: true };
  },
);
