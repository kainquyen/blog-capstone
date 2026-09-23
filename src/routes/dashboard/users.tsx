import { createFileRoute } from "@tanstack/react-router";
import { DataTable } from "~/components/data-table";
import { authClient } from "~/lib/auth/auth-client";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/dashboard/users")({
  component: UsersComponent,
  head: () => ({
    meta: [
      { title: "Users" },
      {
        name: "description",
        content: "List of users",
      },
    ],
  }),
});

function UsersComponent() {
  const { session } = Route.useRouteContext();
  const { data, isLoading, error } = useQuery({
    queryKey: ["users"],
    enabled: !!session?.user.email,
    queryFn: async () => {
      const { data, error } = await authClient.admin.listUsers({
        query: {
          sortBy: "createdAt",
          sortDirection: "desc",
          limit: 100,
        },
      });

      if (error) throw new Error(error.message);
      return (data?.users ?? []).filter((u) => u.email !== session.user.email);
    },
  });

  if (isLoading) return <div>Loading...</div>;

  if (error) return <div>Error: {error.message}</div>;

  return <DataTable data={data ?? []} />;
}
