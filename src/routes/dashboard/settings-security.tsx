import { createFileRoute } from '@tanstack/react-router'
import { SecuritySettings } from "~/components/auth/settings/security/security-settings"

export const Route = createFileRoute('/dashboard/settings-security')({
  component: SettingsSecurity,
})

function SettingsSecurity() {
  return (
    <div className="space-y-8 w-full max-w-[1184px] mx-auto px-4 md:px-7 flex-1 py-6">
      <h1 className="text-2xl font-bold">Cài đặt bảo mật</h1>
      <SecuritySettings />
    </div>
  )
}
