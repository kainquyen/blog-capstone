import { createServerFn } from "@tanstack/react-start";
import { sql, eq, and, gte, lte } from "drizzle-orm";
import { getDb } from "~/lib/db/client";
import { posts, likes, bookmarks, dailyAnalytics } from "~/lib/db/schema";
import { authMiddleware } from "~/server/auth-middleware";

export interface DashboardStats {
  posts: {
    total: number;
    published: number;
    drafts: number;
  };
  visitors: {
    last7Days: number;
    previous7Days: number;
    growthRate: number;
  };
  likes: {
    total: number;
  };
  bookmarks: {
    total: number;
  };
}

export const getDashboardStats = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<DashboardStats> => {
    const db = getDb();
    const userId = context.session.user.id;

    // 1. Thống kê bài viết của tác giả hiện tại
    const [postStats] = await db
      .select({
        total: sql<number>`count(*)`,
        published: sql<number>`count(case when ${posts.published} = true then 1 end)`,
        drafts: sql<number>`count(case when ${posts.published} = false then 1 end)`,
      })
      .from(posts)
      .where(eq(posts.authorId, userId));

    // 2. Thống kê likes nhận được trên bài viết của tác giả
    const [likeStats] = await db
      .select({
        total: sql<number>`count(*)`,
      })
      .from(likes)
      .innerJoin(posts, eq(likes.postId, posts.id))
      .where(eq(posts.authorId, userId));

    // 3. Thống kê bookmarks nhận được trên bài viết của tác giả
    const [bookmarkStats] = await db
      .select({
        total: sql<number>`count(*)`,
      })
      .from(bookmarks)
      .innerJoin(posts, eq(bookmarks.postId, posts.id))
      .where(eq(posts.authorId, userId));

    // 4. Thống kê lượt truy cập trong 7 ngày gần nhất và 7 ngày trước đó
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const d7Ago = new Date();
    d7Ago.setDate(now.getDate() - 6);
    const d7AgoStr = d7Ago.toISOString().split("T")[0];

    const d8Ago = new Date();
    d8Ago.setDate(now.getDate() - 7);
    const d8AgoStr = d8Ago.toISOString().split("T")[0];

    const d14Ago = new Date();
    d14Ago.setDate(now.getDate() - 13);
    const d14AgoStr = d14Ago.toISOString().split("T")[0];

    const visitorRows = await db
      .select({
        date: dailyAnalytics.date,
        desktop: dailyAnalytics.desktop,
        mobile: dailyAnalytics.mobile,
      })
      .from(dailyAnalytics)
      .where(
        and(
          gte(dailyAnalytics.date, d14AgoStr),
          lte(dailyAnalytics.date, todayStr)
        )
      );

    let last7DaysVisits = 0;
    let prev7DaysVisits = 0;

    for (const row of visitorRows) {
      const visits = Number(row.desktop ?? 0) + Number(row.mobile ?? 0);
      if (row.date >= d7AgoStr && row.date <= todayStr) {
        last7DaysVisits += visits;
      } else if (row.date >= d14AgoStr && row.date <= d8AgoStr) {
        prev7DaysVisits += visits;
      }
    }

    let growthRate = 0;
    if (prev7DaysVisits > 0) {
      growthRate =
        Math.round(
          ((last7DaysVisits - prev7DaysVisits) / prev7DaysVisits) * 100 * 10
        ) / 10;
    } else if (last7DaysVisits > 0) {
      growthRate = 100;
    }

    return {
      posts: {
        total: Number(postStats?.total ?? 0),
        published: Number(postStats?.published ?? 0),
        drafts: Number(postStats?.drafts ?? 0),
      },
      visitors: {
        last7Days: last7DaysVisits,
        previous7Days: prev7DaysVisits,
        growthRate,
      },
      likes: {
        total: Number(likeStats?.total ?? 0),
      },
      bookmarks: {
        total: Number(bookmarkStats?.total ?? 0),
      },
    };
  });
