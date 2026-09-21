import { createFileRoute } from "@tanstack/react-router";
import { SectionCards } from "~/components/section-cards";
import { ChartAreaInteractive } from "~/components/chart-area-interactive";
import { DataTable } from "~/components/data-table";
import data from "~/data/dashboard.json";
import { authClient } from "~/lib/auth/auth-client";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHomePage,
});

function DashboardHomePage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await authClient.admin.listUsers({
        query: {
          limit: 100,
        },
      });

      if (error) {
        console.error("Lỗi lấy danh sách user:", error);
        return;
      }

      if (data) {
        // Log toàn bộ user ra Console trình duyệt (F12)
        console.log("=== DANH SÁCH USER (CLIENT) ===");
        console.log(data.users);
        setUsers(data.users);
      }
    }

    fetchUsers();
  }, []);
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
        <DataTable data={users} />
      </div>
    </div>
  );
}
