import { Separator } from "~/components/ui/separator";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { useMatches } from "@tanstack/react-router";

export function SiteHeader() {
  const matches = useMatches();

  // Lấy title từ route con (innermost) trở ra, dùng cái đầu tiên có title
  const title = [...matches]
    .reverse()
    .flatMap((m) => m.meta ?? [])
    .find((tag): tag is { title: string } => "title" in tag)?.title ?? "Dashboard";

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <h1 className="text-base font-medium">{title}</h1>
      </div>
    </header>
  );
}
