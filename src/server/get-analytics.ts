import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { gte, lte, asc } from "drizzle-orm";
import { getDb } from "~/lib/db/client";
import { dailyAnalytics } from "~/lib/db/schema";

export const getAnalyticsData = createServerFn({ method: "GET" })
  .validator((days: number) => z.number().default(90).parse(days))
  .handler(async ({ data: days }) => {
    const db = getDb();
    const now = new Date();
    const endDateStr = now.toISOString().split("T")[0];

    const startDate = new Date();
    startDate.setDate(now.getDate() - (days - 1));
    const startDateStr = startDate.toISOString().split("T")[0];

    const dbRows = await db
      .select({
        date: dailyAnalytics.date,
        desktop: dailyAnalytics.desktop,
        mobile: dailyAnalytics.mobile,
      })
      .from(dailyAnalytics)
      .where(
        gte(dailyAnalytics.date, startDateStr) &&
        lte(dailyAnalytics.date, endDateStr)
      )
      .orderBy(asc(dailyAnalytics.date));

    // Map dữ liệu DB vào Map object để lookup O(1)
    const dataMap = new Map<string, { desktop: number; mobile: number }>();
    dbRows.forEach((row) => {
      dataMap.set(row.date, { desktop: row.desktop, mobile: row.mobile });
    });

    // Lấp đầy các ngày còn thiếu trong chuỗi (Fill Missing Dates)
    const chartData: Array<{ date: string; desktop: number; mobile: number }> = [];
    const currentDate = new Date(startDate);

    while (currentDate <= now) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const existing = dataMap.get(dateStr);

      chartData.push({
        date: dateStr,
        desktop: existing ? existing.desktop : 0,
        mobile: existing ? existing.mobile : 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // console.log("chartData", chartData)

    return chartData;
  });