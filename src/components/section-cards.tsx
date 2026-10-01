import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  FileEdit,
  Heart,
  Bookmark,
  ArrowUpRight,
  Eye,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { DashboardStats } from "~/server/dashboard";

interface SectionCardsProps {
  stats?: DashboardStats;
}

export function SectionCards({ stats }: SectionCardsProps) {
  const postTotal = stats?.posts.total ?? 0;
  const postPublished = stats?.posts.published ?? 0;
  const postDrafts = stats?.posts.drafts ?? 0;

  const visitorsLast7Days = stats?.visitors.last7Days ?? 0;
  const growthRate = stats?.visitors.growthRate ?? 0;
  const isPositiveGrowth = growthRate > 0;
  const isNegativeGrowth = growthRate < 0;

  const totalLikes = stats?.likes.total ?? 0;
  const totalBookmarks = stats?.bookmarks.total ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {/* Card 1: Tổng bài viết */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Tổng bài viết</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {postTotal}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1 font-normal text-xs">
              <FileText className="size-3 text-primary" />
              {postPublished} đã xuất bản
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex items-center gap-1.5 font-medium text-foreground">
            <FileEdit className="size-4 text-muted-foreground" />
            {postDrafts > 0 ? `${postDrafts} bài viết bản nháp` : "Không có bản nháp nào"}
          </div>
          <div className="text-muted-foreground">
            <Link
              to="/dashboard/posts"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Quản lý bài viết <ArrowUpRight className="size-3" />
            </Link>
          </div>
        </CardFooter>
      </Card>

      {/* Card 2: Lượt truy cập gần đây */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Lượt truy cập (7 ngày)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {visitorsLast7Days.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={`gap-1 font-normal text-xs ${
                isPositiveGrowth
                  ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : isNegativeGrowth
                  ? "border-rose-500/30 text-rose-600 dark:text-rose-400"
                  : "text-muted-foreground"
              }`}
            >
              {isPositiveGrowth ? (
                <TrendingUp className="size-3" />
              ) : isNegativeGrowth ? (
                <TrendingDown className="size-3" />
              ) : (
                <Minus className="size-3" />
              )}
              {isPositiveGrowth ? `+${growthRate}%` : `${growthRate}%`}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex items-center gap-1.5 font-medium text-foreground">
            <Eye className="size-4 text-muted-foreground" />
            {isPositiveGrowth
              ? "Tăng trưởng so với tuần trước"
              : isNegativeGrowth
              ? "Giảm so với tuần trước"
              : "Ổn định so với tuần trước"}
          </div>
          <div className="text-muted-foreground">
            <Link
              to="/dashboard/analytics"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Xem biểu đồ chi tiết <ArrowUpRight className="size-3" />
            </Link>
          </div>
        </CardFooter>
      </Card>

      {/* Card 3: Lượt yêu thích */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Lượt yêu thích</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalLikes.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1 font-normal text-xs border-rose-500/20 text-rose-600 dark:text-rose-400">
              <Heart className="size-3 fill-rose-500 text-rose-500" />
              Yêu thích
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex items-center gap-1.5 font-medium text-foreground">
            <Heart className="size-4 fill-rose-500/20 text-rose-500" />
            Tương tác độc giả
          </div>
          <div className="text-muted-foreground text-xs">
            Tổng lượt thích trên các bài viết
          </div>
        </CardFooter>
      </Card>

      {/* Card 4: Lượt lưu bài viết */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Lượt lưu bài viết</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalBookmarks.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1 font-normal text-xs border-amber-500/20 text-amber-600 dark:text-amber-400">
              <Bookmark className="size-3 fill-amber-500 text-amber-500" />
              Bookmarks
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex items-center gap-1.5 font-medium text-foreground">
            <Bookmark className="size-4 fill-amber-500/20 text-amber-500" />
            Giá trị nội dung cao
          </div>
          <div className="text-muted-foreground text-xs">
            Được độc giả lưu lại để đọc
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
