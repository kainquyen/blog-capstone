import { BookmarkIcon, Heart, Share2 } from "lucide-react";
import { useLocation } from "@tanstack/react-router";
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
export function PostActions() {
  const shareUrl = useLocation({
    select: (location) => location.pathname,
  });
  const title = "Test Share";
  const encodeUrl = encodeURIComponent(window.location.href);
  console.log(encodeUrl);
  const encodeTitle = encodeURIComponent(title);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeUrl}`,
  };

  const shareToFacebook = () => {
    if (typeof window === "undefined") return;
    const currentUrl = window.location.href;
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    // Mở popup chia sẻ Facebook
    const width = 600;
    const height = 500;
    const left = window.innerWidth / 2 - width / 2 + window.screenX;
    const top = window.innerHeight / 2 - height / 2 + window.screenY;
    window.open(
      shareUrl,
      "facebook-share-dialog",
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`,
    );
  };
  return (
    <>
      <div className="flex items-center gap-2">
        <Toggle aria-label="Toggle like" size="lg" variant="outline">
          <Heart className="group-aria-pressed/toggle:fill-red-500" size={50} />
        </Toggle>
        <Toggle aria-label="Toggle bookmark" size="lg" variant="outline">
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
