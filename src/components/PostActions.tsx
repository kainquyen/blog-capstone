import { BookmarkIcon, Heart, Share2 } from "lucide-react";
import { useLocation, useRouter } from "@tanstack/react-router";
import { bookmarkPost } from "~/server/posts";
import { Button } from "~/components/ui/button";
import { Toggle } from "~/components/ui/toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { toast } from "sonner";
export function PostActions({
  postId,
  bookmarked
}: {
  postId: string;
  bookmarked: boolean;
}) {

  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(bookmarked)

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

  async function handleBookmark() {
    try {
      const response = await bookmarkPost({ data: postId });
      setIsBookmarked(response.bookmarked)
      toast.success(response.bookmarked ? "Đã lưu bài viết" : "Đã bỏ lưu bài viết")

      await router.invalidate();
    } catch (error) {
      setIsBookmarked(bookmarked)
      if(error instanceof Error && error.message.includes("Unauthorized")) {
        toast.error("Bạn cần đăng nhập để bookmark bài viết.");
        return;
      }
      toast.error("Có lỗi xảy ra, vui lòng thử lại")
    }
  }

  useEffect(() => {
    setIsBookmarked(bookmarked);
  }, [bookmarked])
  return (
    <>
      <div className="flex items-center gap-2">
        <Toggle aria-label="Toggle like" size="lg" variant="outline">
          <Heart className="group-aria-pressed/toggle:fill-red-500" size={50} />
        </Toggle>
        <Toggle aria-label="Toggle bookmark" size="lg" variant="outline"
        aria-pressed={isBookmarked}
        onClick={handleBookmark}
        >
          <BookmarkIcon
            className="group-aria-pressed/toggle:fill-yellow-500"
            size={18}
          />
        </Toggle>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="lg">
                <Share2 />
              </Button>
            }
          />
          <DropdownMenuContent className="w-30" align="start">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Chia sẻ qua</DropdownMenuLabel>
              <DropdownMenuItem onClick={shareToFacebook}>Facebook</DropdownMenuItem>
              <DropdownMenuItem>X</DropdownMenuItem>
              <DropdownMenuItem>Instagram</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
