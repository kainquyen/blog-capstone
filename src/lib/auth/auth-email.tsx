// src/lib/auth/send-delete-account-email.tsx
import { sendEmail } from '~/lib/email'
import { DeleteAccountVerificationEmail, EmailVerificationEmail } from "@better-auth-ui/react/email"
import { render } from '@react-email/render'

export async function sendDeleteAccountVerification({
    user,
    url,
}: {
    user: { email: string }
    url: string
}) {
    const html = await render(
        <DeleteAccountVerificationEmail url={url} email={user.email} appName="Blog Capstone" />,
    )
    await sendEmail({
        to: user.email,
        subject: 'Xác nhận xóa tài khoản',
        html,
    })
}

export async function sendVerificationEmail({
    user,
    url,
}: {
    user: { email: string }
    url: string
}) {
    const html = await render(
        <EmailVerificationEmail url={url} email={user.email} expirationMinutes={60} poweredBy={false} appName="Blog Capstone" />,
    )
    await sendEmail({
        to: user.email,
        subject: 'Xác thực tài khoản',
        html,
    })
}