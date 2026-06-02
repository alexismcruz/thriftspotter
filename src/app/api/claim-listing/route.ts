import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const body = await req.json();
    const { shopName, shopSlug, ownerName, email, phone, message } = body;

    if (!ownerName || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    const shopUrl = `https://www.thriftspotter.com/shop/${shopSlug}`;

    // Send notification to ThriftSpotter inbox
    await resend.emails.send({
      from: "ThriftSpotter <noreply@thriftspotter.com>",
      to: "hello@thriftspotter.com",
      replyTo: email,
      subject: `Claim Listing: ${shopName}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;color:#1c1917">
          <div style="background:#0d9488;padding:24px 32px;border-radius:12px 12px 0 0">
            <h1 style="color:white;margin:0;font-size:20px">🏪 New Listing Claim Request</h1>
          </div>
          <div style="background:#f5f5f4;padding:32px;border-radius:0 0 12px 12px">
            <table style="width:100%;border-collapse:collapse;background:white;border-radius:10px;overflow:hidden">
              <tr style="border-bottom:1px solid #e7e5e4">
                <td style="padding:14px 20px;color:#78716c;font-size:13px;width:140px">Business</td>
                <td style="padding:14px 20px;font-weight:600;font-size:14px">${shopName}</td>
              </tr>
              <tr style="border-bottom:1px solid #e7e5e4">
                <td style="padding:14px 20px;color:#78716c;font-size:13px">Owner Name</td>
                <td style="padding:14px 20px;font-size:14px">${ownerName}</td>
              </tr>
              <tr style="border-bottom:${message ? "1px solid #e7e5e4" : "none"}">
                <td style="padding:14px 20px;color:#78716c;font-size:13px">Email</td>
                <td style="padding:14px 20px;font-size:14px"><a href="mailto:${email}" style="color:#0d9488">${email}</a></td>
              </tr>
              ${message ? `
              <tr>
                <td style="padding:14px 20px;color:#78716c;font-size:13px;vertical-align:top">Message</td>
                <td style="padding:14px 20px;font-size:14px">${message}</td>
              </tr>` : ""}
            </table>
            <div style="margin-top:24px;text-align:center">
              <a href="${shopUrl}" style="display:inline-block;background:#0d9488;color:white;text-decoration:none;padding:10px 24px;border-radius:8px;font-weight:600;font-size:13px">
                View Shop Page →
              </a>
            </div>
          </div>
        </div>
      `,
    });

    // Send confirmation auto-reply to the business owner
    await resend.emails.send({
      from: "ThriftSpotter <noreply@thriftspotter.com>",
      replyTo: "hello@thriftspotter.com",
      to: email,
      subject: `We received your claim for ${shopName}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1c1917">
          <div style="background:#0d9488;padding:24px 32px;border-radius:12px 12px 0 0">
            <h1 style="color:white;margin:0;font-size:20px">🛍️ ThriftSpotter</h1>
          </div>
          <div style="background:white;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e7e5e4;border-top:none">
            <p style="font-size:16px;margin:0 0 16px">Hi ${ownerName},</p>
            <p style="color:#44403c;font-size:15px;line-height:1.6;margin:0 0 20px">
              Thanks for reaching out! We've received your claim request for <strong>${shopName}</strong> and we'll be in touch within 1–2 business days to verify and update your listing.
            </p>
            <div style="background:#f0fdfa;border-left:4px solid #0d9488;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:24px">
              <p style="margin:0;font-size:14px;color:#134e4a;font-weight:600">What happens next:</p>
              <ol style="margin:8px 0 0;padding-left:20px;color:#134e4a;font-size:13px;line-height:1.8">
                <li>We verify your ownership of the business</li>
                <li>We update your listing with your correct info</li>
                <li>You get featured placement in your city — free</li>
              </ol>
            </div>
            <p style="color:#44403c;font-size:14px;line-height:1.6;margin:0 0 24px">
              In the meantime, you can view your current listing here:
            </p>
            <div style="text-align:center;margin-bottom:24px">
              <a href="${shopUrl}" style="display:inline-block;background:#0d9488;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px">
                View your listing →
              </a>
            </div>
            <p style="color:#78716c;font-size:13px;margin:0">
              Questions? Just reply to this email and we'll get back to you.<br/>
              — Alexis, ThriftSpotter
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("claim-listing error:", err);
    return NextResponse.json({ error: "Failed to send. Please try again." }, { status: 500 });
  }
}
