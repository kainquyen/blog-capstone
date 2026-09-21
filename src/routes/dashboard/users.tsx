import { createFileRoute } from "@tanstack/react-router";
import { DataTable } from "~/components/data-table";
import { useEffect, useState } from "react";
import { authClient } from "~/lib/auth/auth-client";

export const Route = createFileRoute("/dashboard/users")({
  component: UsersComponent,
  head: () => ({
    meta: [
      { title: "Users" },
      {
        name: 'description',
        content: 'List of users',
      },
    ]
  })
});

function UsersComponent() {
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
        // console.log(data.users);
        setUsers(data.users);
      }
    }

    fetchUsers();
  }, []);
  return <DataTable data={users} />;
}
