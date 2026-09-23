import * as React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  FlexRender,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type Row,
  type SortingState,
  useTable,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Tabs, TabsContent } from "~/components/ui/tabs";
import { Switch } from "~/components/ui/switch";
import {
  ChevronDownIcon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  Columns3Icon,
  Pen,
  LockOpen,
  Ban,
} from "lucide-react";
import { authClient } from "~/lib/auth/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import { schema } from "../user-schema";
import { features, columns } from "./users-table-columns";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Field, FieldGroup } from "~/components/ui/field";
import { NativeSelect, NativeSelectOption } from "~/components/ui/native-select";

function DraggableRow({
  row,
}: {
  row: Row<typeof features, z.infer<typeof schema>>;
}) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });
  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          <FlexRender cell={cell} />
        </TableCell>
      ))}
    </TableRow>
  );
}
export function UsersTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[];
}) {
  const [data, setData] = React.useState(() => initialData);
  // Sync khi initialData thay đổi (vd: sau khi API trả về)
  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [emailVerified, setEmailVerified] = React.useState(false);
  const [role, setRole] = React.useState("user");
  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );
  const queryClient = useQueryClient();
  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data],
  );
  const table = useTable({
    features,
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
  });
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }
  async function handleBanMultipleUser() {
    const selectedIds = selectedRows.map((row) => row.original.id);

    const results = await Promise.allSettled(
      selectedIds.map((id) =>
        authClient.admin.banUser({
          userId: id,
          banReason: "Vi phạm tiểu chuẩn cộng đồng",
        }),
      ),
    );
    const successful = results.filter(
      (result) => result.status === "fulfilled" && !result.value.error,
    ).length;
    const failed = results.length - successful;

    toast.success(
      `Đã ban thành công ${successful}/${selectedIds.length} người dùng`,
    );
    queryClient.invalidateQueries({
      queryKey: ["users"],
    });
    if (failed > 0) {
      toast.error(`Thất bại ${failed} người dùng`);
    }
  }

  async function handleUnbanMultipleUser() {
    const selectedIds = selectedRows.map((row) => row.original.id);

    const results = await Promise.allSettled(
      selectedIds.map((id) =>
        authClient.admin.unbanUser({
          userId: id,
        }),
      ),
    );
    const successful = results.filter(
      (result) => result.status === "fulfilled" && !result.value.error,
    ).length;
    const failed = results.length - successful;

    queryClient.invalidateQueries({
      queryKey: ["users"],
    });
    toast.success(
      `Đã unban thành công ${successful}/${selectedIds.length} người dùng`,
    );
    if (failed > 0) {
      toast.error(`Thất bại ${failed} người dùng`);
    }
  }

  async function handleEditProfileMultiple(e: React.FormEvent) {
    e.preventDefault();
    const selectedIds = selectedRows.map((row) => row.original.id);
    const results = await Promise.allSettled(
      selectedIds.map((id) => {
        return authClient.admin.updateUser({
          userId: id,
          data: {
            emailVerified: emailVerified,
            role: role as "user" | "admin",
          },
        });
      }),
    );

    const successful = results.filter(
      (result) => result.status === "fulfilled" && !result.value.error,
    ).length;
    const failed = results.length - successful;

    queryClient.invalidateQueries({
      queryKey: ["users"],
    });
    toast.success(
      `Đã cập nhật thành công ${successful}/${selectedIds.length} người dùng`,
    );
    if (failed > 0) {
      toast.error(`Thất bại ${failed} người dùng`);
    }
  }

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6 mt-5"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
              <Columns3Icon data-icon="inline-start" />
              Hiển thị
              <ChevronDownIcon data-icon="inline-end" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide(),
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog>
            <form>
              <DialogTrigger
                render={
                  <Button variant="outline">
                    <Pen />
                    Sửa
                  </Button>
                }
              />

              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle className="leading-5">
                    Thay đổi thông tin user
                  </DialogTitle>
                  <DialogDescription>
                    Thông tin user được thay đổi chỉ gồm trạng thái xác thực và
                    quyền.
                  </DialogDescription>
                </DialogHeader>
                <FieldGroup>
                  <Field>
                    <Label htmlFor="email-verified">Xác thực email</Label>
                    <Switch
                      id="email-verified"
                      checked={emailVerified}
                      onCheckedChange={() => setEmailVerified(!emailVerified)}
                    />
                  </Field>
                  <Field>
                    <Label htmlFor="role">Quyền</Label>
                    <NativeSelect
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <NativeSelectOption value="user">User</NativeSelectOption>
                      <NativeSelectOption value="admin">
                        Admin
                      </NativeSelectOption>
                    </NativeSelect>
                  </Field>
                </FieldGroup>
                <DialogFooter>
                  <DialogClose
                    render={<Button variant="outline">Hủy</Button>}
                  />
                  <Button type="submit" onClick={handleEditProfileMultiple}>
                    Lưu thay đổi
                  </Button>
                </DialogFooter>
              </DialogContent>
            </form>
          </Dialog>
          <DropdownMenu disabled={selectedRows.length === 0}>
            <DropdownMenuTrigger
              render={
                <Button variant="outline">
                  Thao tác ({selectedRows.length}){" "}
                  <ChevronDownIcon data-icon="inline-end" />
                </Button>
              }
            />
            <DropdownMenuContent>
              <DropdownMenuItem
                className="text-green-500 hover:bg-green-500/10 hover:text-green-500"
                onClick={handleUnbanMultipleUser}
              >
                <LockOpen />
                Unban
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={handleBanMultipleUser}
              >
                <Ban />
                Ban/Cấm
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Input
          placeholder="Tìm kiếm user theo email..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            table.getColumn("email")?.setFilterValue(event.target.value);
          }}
          className="w-2xs"
        />
      </div>
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder ? null : (
                            <FlexRender header={header} />
                          )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.state.pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
                items={[10, 20, 30, 40, 50].map((pageSize) => ({
                  label: `${pageSize}`,
                  value: `${pageSize}`,
                }))}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue placeholder={table.state.pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  <SelectGroup>
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.state.pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRightIcon />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRightIcon />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
