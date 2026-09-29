import { BookmarkIcon, Heart, Share2 } from "lucide-react";
import { useLoaderData, useLocation, useRouter } from "@tanstack/react-router";
import { bookmarkPost, likePost } from "~/server/posts";
import { Button } from "~/components/ui/button";
import { Toggle } from "~/components/ui/toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Hàm format số gọn đẹp (ví dụ: 1200 -> 1.2k)
function formatCompactNumber(number: number) {
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(number);
}

export function PostActions() {
  const router = useRouter();
  const {post } = useLoaderData({from: "/posts/$slug"})
  const postId = post.id
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);

  const shareUrl = useLocation({
    select: (location) => location.pathname,
  });
  const encodeUrl = encodeURIComponent(shareUrl);
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeUrl}`,
  };

  const shareToFacebook = () => {
    if (typeof window === "undefined") return;
    const width = 600;
    const height = 500;
    const left = window.innerWidth / 2 - width / 2 + window.screenX;
    const top = window.innerHeight / 2 - height / 2 + window.screenY;
    window.open(
      shareLinks.facebook,
      "facebook-share-dialog",
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`,
    );
  };

  async function handleLike() {
    // Xử lý Optimistic UI cho like
    const prevLiked = isLiked;
    const prevCount = Number(likesCount);
    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const response = await likePost({ data: postId })
      toast.success(
        response.liked ? "Đã thích bài viết" : "Đã bỏ thích bài viết",
      );
      await router.invalidate();
    } catch (error) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      if (error instanceof Error && error.message.includes("Unauthorized")) {
        toast.error("Bạn cần đăng nhập để thích bài viết.");
        return;
      }
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    }
  }

  async function handleBookmark() {
    try {
      const response = await bookmarkPost({ data: postId });
      setIsBookmarked(response.bookmarked);
      toast.success(
        response.bookmarked ? "Đã lưu bài viết" : "Đã bỏ lưu bài viết",
      );
      await router.invalidate();
    } catch (error) {
      setIsBookmarked(post.isBookmarked);
      if (error instanceof Error && error.message.includes("Unauthorized")) {
        toast.error("Bạn cần đăng nhập để bookmark bài viết.");
        return;
      }
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    }
  }

  useEffect(() => {
    setIsBookmarked(post.isBookmarked);
    setIsLiked(post.isLiked)
    setLikesCount(post.likesCount)
  }, [post.isBookmarked, post.isLiked, post.likesCount]);

  return (
    <TooltipProvider>
      <div className="inline-flex items-center gap-1.5 p-1 rounded-full border border-border bg-card/60 backdrop-blur-sm shadow-xs">
        {/* Nút Like kèm Số lượt like */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                onClick={handleLike}
                className={`flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                  isLiked
                    ? "bg-red-500/10 text-red-600 dark:text-red-400"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
                variant="ghost"
              >
                <Heart
                  size={18}
                  className={`transition-transform duration-200 ${
                    isLiked ? "fill-red-500 text-red-500 scale-110" : ""
                  }`}
                />
                <span>{formatCompactNumber(likesCount)}</span>
              </Button>
            }
          ></TooltipTrigger>
          <TooltipContent>
            {isLiked ? "Bỏ thích" : "Thích bài viết"}
          </TooltipContent>
        </Tooltip>

        <div className="h-4 w-px bg-border my-auto" />

        {/* Nút Bookmark */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Toggle
                aria-label="Toggle bookmark"
                size="sm"
                variant="outline"
                aria-pressed={isBookmarked}
                onClick={handleBookmark}
                className="h-9 w-9 p-0 rounded-full cursor-pointer hover:bg-accent data-[state=on]:bg-amber-500/10"
              >
                <BookmarkIcon
                  size={18}
                  className={`transition-colors ${
                    isBookmarked
                      ? "fill-amber-500 text-amber-500"
                      : "text-muted-foreground"
                  }`}
                />
              </Toggle>
            }
          />
          <TooltipContent>
            {isBookmarked ? "Bỏ lưu bài viết" : "Lưu bài viết"}
          </TooltipContent>
        </Tooltip>

        {/* Nút Share Dropdown */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger
              render={
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
                    >
                      <Share2 size={18} />
                    </Button>
                  }
                />
              }
            />
            <TooltipContent>Chia sẻ</TooltipContent>
          </Tooltip>

          <DropdownMenuContent className="w-40" align="start">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Chia sẻ qua</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={shareToFacebook}
                className="cursor-pointer"
              >
                Facebook
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                X (Twitter)
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                Instagram
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
}
