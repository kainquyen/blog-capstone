// src/lib/auth/send-delete-account-email.tsx
import { sendEmail } from '~/lib/email'
import { DeleteAccountVerificationEmail, EmailVerificationEmail, ResetPasswordEmail, PasswordChangedEmail } from "@better-auth-ui/react/email"
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
    token
}: {
    user: { email: string }
    url: string
    token: string
}) {
    const customUrlVerify = `${process.env.BETTER_AUTH_URL}/auth/reset-link-verify?token=${token}&email=${encodeURIComponent(user.email)}`
    const html = await render(
        <EmailVerificationEmail url={customUrlVerify} email={user.email} expirationMinutes={1} poweredBy={false} appName="Blog Capstone" />,
    )
    await sendEmail({
        to: user.email,
        subject: 'Xác thực tài khoản',
        html,
    })
}

export async function sendResetPassword({
    user,
    url,
}: {
    user: { email: string }
    url: string
}) {
    const html = await render(
        <ResetPasswordEmail url={url} email={user.email} expirationMinutes={60} poweredBy={false} appName="Blog Capstone" />,
    )
    await sendEmail({
        to: user.email,
        subject: 'Đặt lại mật khẩu',
        html,
    })
}

export async function sendPasswordResetNotification({
    user,
    timestamp
}: {
    user: { email: string }
    timestamp: string
}) {
    const html = await render(
        <PasswordChangedEmail timestamp={timestamp} email={user.email} poweredBy={false} appName="Blog Capstone" />,
    )
    await sendEmail({
        to: user.email,
        subject: 'Mật khẩu đã được thay đổi',
        html,
    })
}