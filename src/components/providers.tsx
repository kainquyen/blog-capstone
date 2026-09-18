import { Link, useNavigate } from "@tanstack/react-router"
import type { ReactNode } from "react"
import { authClient } from "~/lib/auth/auth-client"
import { AuthProvider } from "./auth/auth-provider"

export function Providers({ children }: { children: ReactNode }) {
  const navigate = useNavigate()

  return (
    <AuthProvider
      authClient={authClient}
      navigate={({ to, replace }) => navigate({ to, replace })}
      Link={({ href, ...props }) => <Link to={href} {...props} />}
      localization={{
        settings: {
          // --- Tab Navigation ---
          settings: "Cài đặt",
          account: "Tài khoản",
          security: "Bảo mật",
          // --- Account Settings ---
          userProfile: "Thông tin cá nhân",
          avatar: "Ảnh đại diện",
          changeAvatar: "Đổi ảnh đại diện",
          uploadAvatar: "Tải ảnh lên",
          deleteAvatar: "Xóa ảnh",
          avatarChangedSuccess: "Đã cập nhật ảnh đại diện thành công",
          avatarDeletedSuccess: "Đã xóa ảnh đại diện thành công",
          saveChanges: "Lưu thay đổi",
          profileUpdatedSuccess: "Cập nhật hồ sơ thành công",
          changeEmail: "Đổi địa chỉ email",
          updateEmail: "Cập nhật email",
          changeEmailSuccess: "Đã gửi email xác nhận đổi địa chỉ email",
          // --- Security: Đổi mật khẩu ---
          changePassword: "Đổi mật khẩu",
          currentPassword: "Mật khẩu hiện tại",
          currentPasswordPlaceholder: "Nhập mật khẩu hiện tại",
          updatePassword: "Cập nhật mật khẩu",
          changePasswordSuccess: "Đổi mật khẩu thành công",
          setPassword: "Thiết lập mật khẩu",
          setPasswordDescription: "Bạn chưa có mật khẩu. Yêu cầu liên kết để tạo mật khẩu mới.",
          // --- Security: Quản lý phiên hoạt động ---
          activeSessions: "Phiên hoạt động",
          currentSession: "Phiên hiện tại",
          revoke: "Hủy phiên",
          revokeSession: "Hủy phiên đăng nhập",
          revokeSessionSuccess: "Đã hủy phiên đăng nhập thành công",
          signOutOtherDevices: "Đăng xuất khỏi thiết bị khác",
          signOutOtherDevicesDescription: "Hành động này sẽ đăng xuất bạn khỏi tất cả thiết bị ngoại trừ thiết bị này.",
          signOutOtherDevicesSuccess: "Đã đăng xuất khỏi các thiết bị khác thành công",
          signOutEverywhere: "Đăng xuất khỏi tất cả thiết bị",
          signOutEverywhereDescription: "Hành động này sẽ đăng xuất bạn khỏi thiết bị này và tất cả các thiết bị khác.",
          time: "Thời gian",
          active: "Đang hoạt động",
          cancel: "Hủy"
        },
        auth: {
          name: "Họ và tên",
          email: "Email",
          emailPlaceholder: "nhap@email.cua.ban",
          password: "Mật khẩu",
          passwordPlaceholder: "Mật khẩu",
          newPassword: "Mật khẩu mới",
          newPasswordPlaceholder: "Nhập mật khẩu mới",
          confirmPassword: "Xác nhận mật khẩu",
          confirmPasswordPlaceholder: "Nhập lại mật khẩu mới",
          signOut: "Đăng xuất",
          signIn: "Đăng nhập",
          signUp: "Đăng ký",
          fieldRequired: "Trường này là bắt buộc",
          invalidEmail: "Địa chỉ email không hợp lệ",
          passwordsDoNotMatch: "Mật khẩu không khớp",
          sendResetLink: "Gửi liên kết đặt lại mật khẩu"
        }
      }}
    >
      {children}
    </AuthProvider>
  )
}
