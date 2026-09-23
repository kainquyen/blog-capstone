import * as React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Switch } from "~/components/ui/switch";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Field, FieldGroup } from "~/components/ui/field";
import {
  NativeSelect,
  NativeSelectOption,
} from "~/components/ui/native-select";
import { authClient } from "~/lib/auth/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import { schema } from "../user-schema";
import { Ban, LockOpen, Pen } from "lucide-react";

export function RowActions({ item }: { item: z.infer<typeof schema> }) {
  const [banOpen, setBanOpen] = useState(false);
  const [unbanOpen, setUnbanOpen] = useState(false);
  const [emailVerified, setEmailVerified] = useState<boolean>(
    item.emailVerified,
  );
  const [role, setRole] = useState<string>(item.role);

  const queryClient = useQueryClient();

  async function handleBanConfirm() {
    const { error } = await authClient.admin.banUser({
      userId: item.id,
      banReason: "Vi phạm điều khoản cộng đồng", // Lý do ban (tùy chọn)
      // banExpiresIn: "7d" // Thời hạn ban, ví dụ 7 ngày (tùy chọn)
    });

    if (error) {
      console.error("Lỗi khi ban user:", error.message);
      return;
    }
    queryClient.invalidateQueries({
      queryKey: ["users"],
    });
    toast.success(`Ban thành công với ${item.email}`);
    setBanOpen(false);
  }

  async function handleUnbanConfirm() {
    const { error } = await authClient.admin.unbanUser({
      userId: item.id,
    });

    if (error) {
      console.error("Lỗi khi bỏ ban user:", error.message);
      return;
    }

    queryClient.invalidateQueries({
      queryKey: ["users"],
    });
    toast.success(`Gỡ ban thành công cho ${item.email}`);
    setUnbanOpen(false);
  }

  async function handleEditProfile(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await authClient.admin.updateUser({
      userId: item.id,
      data: {
        emailVerified: emailVerified,
        role: role as "user" | "admin",
      },
    });
    if (error) {
      toast.error(`Lỗi khi thay đổi thông tin của ${item.email}`);
      console.error("Lỗi khi update user:", error.message);
      return;
    }
    queryClient.invalidateQueries({
      queryKey: ["users"],
    });
    toast.success(`Thay đổi thông tin thành công cho ${item.email}`);
  }

  return (
    <div className="flex items-center gap-2">
      <Dialog>
        <form>
          <Tooltip>
            <TooltipTrigger
              render={
                <DialogTrigger
                  render={
                    <Button variant="outline">
                      <Pen />
                    </Button>
                  }
                />
              }
            />
            <TooltipContent>Thay đổi thông tin</TooltipContent>
          </Tooltip>

          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="leading-5">
                Thay đổi thông tin user:{" "}
                <span className="italic">{item.email}</span>
              </DialogTitle>
              <DialogDescription>
                Thông tin user được thay đổi chỉ gồm trạng thái xác thực và
                quyền.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <Label htmlFor="name-1">Tên</Label>
                <Input id="name-1" defaultValue={item.name} disabled readOnly />
              </Field>
              <Field>
                <Label htmlFor="email-1">Email</Label>
                <Input id="email-1" defaultValue={item.email} disabled readOnly />
              </Field>
              <Field>
                <Label htmlFor="email-verified-1">Xác thực email</Label>
                <Switch
                  id="email-verified-1"
                  checked={emailVerified}
                  onCheckedChange={() => setEmailVerified(!emailVerified)}
                />
              </Field>
              <Field>
                <Label htmlFor="role-1">Quyền</Label>
                <NativeSelect
                  id="role-1"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <NativeSelectOption value="user">User</NativeSelectOption>
                  <NativeSelectOption value="admin">Admin</NativeSelectOption>
                </NativeSelect>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <DialogClose render={<Button variant="outline">Hủy</Button>} />
              <Button type="submit" onClick={handleEditProfile}>
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>

      {!item.banned ? (
        <>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="outline"
                  className="cursor-pointer rounded px-2 py-1 text-sm"
                  onClick={() => setBanOpen(true)}
                >
                  <Ban size={14} color="red" />
                </Button>
              }
            />
            <TooltipContent>Ban/Cấm người dùng</TooltipContent>
          </Tooltip>

          <AlertDialog open={banOpen} onOpenChange={setBanOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Bạn có chắc chắn muốn ban user này không?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Hành động này có thể hoàn tác. Nó sẽ khóa tài khoản của user
                  này.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setBanOpen(false)}>
                  Hủy
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 text-white hover:bg-red-600"
                  onClick={handleBanConfirm}
                >
                  Đồng ý
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      ) : (
        <>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="outline"
                  className="cursor-pointer rounded px-2 py-1 text-sm"
                  onClick={() => setUnbanOpen(true)}
                >
                  <LockOpen size={14} color="green" />
                </Button>
              }
            />
            <TooltipContent>Bỏ Ban/Cấm người dùng</TooltipContent>
          </Tooltip>

          <AlertDialog open={unbanOpen} onOpenChange={setUnbanOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Bạn có chắc chắn muốn bỏ ban user này không?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Hành động này có thể hoàn tác. Nó sẽ mở khóa tài khoản của
                  user này.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setUnbanOpen(false)}>
                  Hủy
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-green-600 text-white hover:bg-green-700"
                  onClick={handleUnbanConfirm}
                >
                  Đồng ý
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}

