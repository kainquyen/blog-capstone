import { createFileRoute } from "@tanstack/react-router";
import { SectionCards } from "~/components/section-cards";
import { getDashboardStats } from "~/server/dashboard";

export const Route = createFileRoute("/dashboard/")({
  loader: async () => {
    return await getDashboardStats();
  },
  component: DashboardHomePage,
  head: () => ({
    meta: [{ title: "Dashboard" }],
  }),
});

function DashboardHomePage() {
  const stats = Route.useLoaderData();

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards stats={stats} />
      </div>
    </div>
  );
}
