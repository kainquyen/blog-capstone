import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendVerificationEmail({ to, subject, html }: SendEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Capstone <onboarding@resend.dev>', // Thay bằng domain đã verify của bạn khi lên Production
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Lỗi gửi email từ Resend:', error);
      throw new Error(error.message);
    }

    return data;
  } catch (err) {
    console.error('Lỗi khi thực thi sendEmail:', err);
  }
}

export async function sendResetPassword({to, subject, html}: SendEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Capstone <onboarding@resend.dev>",
      to,
      subject,
      html,
    })

    if (error) {
      console.error('Lỗi gửi email từ Resend:', error);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Lỗi khi thực thi sendEmail:', error);
  }
}