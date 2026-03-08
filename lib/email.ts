import { Resend } from "resend";
import { productConfig } from "@/config/product";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL =
  process.env.EMAIL_FROM ?? `${productConfig.name} <noreply@resend.dev>`;

export async function sendWelcomeEmail(to: string) {
  if (!resend) {
    console.log(`[email] skipped welcome email to ${to} (no RESEND_API_KEY)`);
    return;
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Welcome to ${productConfig.name}!`,
    html: `
      <h1>Welcome to ${productConfig.name}</h1>
      <p>Your account has been created with ${productConfig.pricing.plans[0]?.credits ?? 5} free credits.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://localhost:3000"}/dashboard">Go to your dashboard</a></p>
    `,
  });

  console.log(`[email] welcome email sent to ${to}`);
}

export async function sendRunCompletedEmail(
  to: string,
  executionId: string,
  status: "completed" | "failed"
) {
  if (!resend) {
    console.log(`[email] skipped run notification to ${to} (no RESEND_API_KEY)`);
    return;
  }

  const subject =
    status === "completed"
      ? `Your ${productConfig.name} result is ready`
      : `Your ${productConfig.name} run failed`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html: `
      <h1>${subject}</h1>
      <p>Execution ID: <code>${executionId}</code></p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://localhost:3000"}/history">View your results</a></p>
    `,
  });

  console.log(`[email] run ${status} email sent to ${to}`);
}
