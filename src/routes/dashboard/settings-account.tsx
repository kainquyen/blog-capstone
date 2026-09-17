import { createFileRoute } from '@tanstack/react-router'
import { Settings } from "~/components/auth/settings/settings"

export const Route = createFileRoute('/dashboard/settings-account')({
  component: SettingsAccount,
})

function SettingsAccount() {
  return (
    <div className="space-y-8 w-full max-w-[1184px] mx-auto px-4 md:px-7 flex-1 py-6">
      <h1 className="text-2xl font-bold">Cài đặt tài khoản</h1>
      <Settings view="account" />
    </div>
  )
}
