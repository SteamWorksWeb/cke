import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const { firstName, lastName, email, question, recaptchaToken } = await req.json();

    // ── 1. Verify reCAPTCHA token ──────────────────────────────────
    if (!recaptchaToken) {
      return NextResponse.json({ error: "Missing reCAPTCHA token." }, { status: 400 });
    }

    const recaptchaRes = await fetch(
      `https://www.google.com/recaptcha/api/siteverify`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
      }
    );

    const recaptchaData = await recaptchaRes.json();

    // v3 returns a score 0.0–1.0 (1.0 = definitely human)
    if (!recaptchaData.success || recaptchaData.score < 0.5) {
      return NextResponse.json(
        { error: "reCAPTCHA verification failed. Please try again." },
        { status: 400 }
      );
    }

    // ── 2. Validate required fields ────────────────────────────────
    if (!firstName || !lastName || !email || !question) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    // ── 3. Send email via Resend ───────────────────────────────────
    const { error } = await resend.emails.send({
      from: "Clay Knows Everything <noreply@clayknowseverything.com>",
      to: [process.env.CONTACT_EMAIL!],
      replyTo: email,
      subject: `New Question from ${firstName} ${lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #000; padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 22px;">📬 New Ask Clay Submission</h1>
          </div>
          <div style="background: #f9f9f9; padding: 28px; border-radius: 0 0 8px 8px; border: 1px solid #eee;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555; width: 120px;">Name</td>
                <td style="padding: 8px 0; color: #111;">${firstName} ${lastName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Email</td>
                <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #e07b00;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555; vertical-align: top;">Question</td>
                <td style="padding: 8px 0; color: #111; line-height: 1.6;">${question.replace(/\n/g, "<br>")}</td>
              </tr>
            </table>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Sent from clayknowseverything.com · reCAPTCHA score: ${recaptchaData.score}
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
