import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const normalised = email.toLowerCase().trim();

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("waitlist")
    .insert({ email: normalised });

  // Unique violation — already signed up, still return success
  if (error && error.code !== "23505") {
    console.error("Waitlist insert error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }

  const alreadySignedUp = error?.code === "23505";

  if (!alreadySignedUp) {
    await Promise.all([
      // Confirmation to subscriber
      resend.emails.send({
        from: FROM,
        to: normalised,
        subject: "You're on the Sundeas AI waitlist",
        html: confirmationEmail(APP_URL),
      }),
      // Notification to owner
      ...(process.env.NOTIFY_EMAIL
        ? [
            resend.emails.send({
              from: FROM,
              to: process.env.NOTIFY_EMAIL,
              subject: `New waitlist signup: ${normalised}`,
              html: `<p><strong>${normalised}</strong> just joined the Sundeas AI waitlist.</p><p><a href="${APP_URL}">Open Sundeas AI</a></p>`,
            }),
          ]
        : []),
    ]);
  }

  return NextResponse.json({ ok: true });
}

function confirmationEmail(appUrl: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fef8f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef8f4;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

        <tr><td style="padding-bottom:32px;">
          <span style="font-size:22px;font-weight:700;color:#1c0f08;">
            Sundeas<span style="color:#e8611a;">.</span>AI
          </span>
        </td></tr>

        <tr><td style="background:#fff;border:1px solid #fde4cc;border-radius:16px;padding:36px;">
          <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#1c0f08;">
            You&rsquo;re on the list.
          </h1>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#9a6e58;">
            Thanks for signing up. We&rsquo;re building Sundeas AI for people who want
            to make their savings work harder — without needing to become an
            investing expert first.
          </p>
          <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#9a6e58;">
            We&rsquo;ll send you one email when early access opens. No spam, no
            newsletters in the meantime.
          </p>
          <a href="${appUrl}"
            style="display:inline-block;background:#e8611a;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:999px;">
            Visit Sundeas AI →
          </a>
        </td></tr>

        <tr><td style="padding-top:28px;text-align:center;">
          <p style="font-size:11px;color:#9a6e58;margin:0;">
            Sundeas AI &nbsp;·&nbsp; Educational content only, not financial advice
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
