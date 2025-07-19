// src/utils/emailSender.ts
import { Resend } from "resend";

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

const resend = new Resend("re_SRVfv4TF_NV27uCztF5hquhDQpUgbe38F");

export const sendEmail = async ({ to, subject, html }: MailOptions) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Your App Name <onboarding@resend.dev>", // Or your verified sender
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error("Error sending email with Resend:", error);
      throw new Error("Email failed to send");
    }

    console.log(`Email sent to ${to}`, data);
  } catch (err) {
    console.error("Unexpected error:", err);
    throw err;
  }
};
