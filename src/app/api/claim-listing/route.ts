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

    const shopUrl = `https://thriftspotter.com/shop/${shopSlug}`;

    await resend.emails.send({
      from: "ThriftSpotter <noreply@thriftspotter.com>",
      to: "aalexismcruz@gmail.com",
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
                <td style="padding:14px 20px;color:#78716c;font-size:13px;width:140px;white-space:nowrap">Business</td>
                <td style="padding:14px 20px;font-weight:600;font-size:14px">${shopName}</td>
              </tr>
              <tr style="border-bottom:1px solid #e7e5e4">
                <td style="padding:14px 20px;color:#78716c;font-size:13px">Owner Name</td>
                <td style="padding:14px 20px;font-size:14px">${ownerName}</td>
              </tr>
              <tr style="border-bottom:1px solid #e7e5e4">
                <td style="padding:14px 20px;color:#78716c;font-size:13px">Email</td>
                <td style="padding:14px 20px;font-size:14px"><a href="mailto:${email}" style="color:#0d9488">${email}</a></td>
              </tr>
              <tr style="border-bottom:${message ? "1px solid #e7e5e4" : "none"}">
                <td style="padding:14px 20px;color:#78716c;font-size:13px">Phone</td>
                <td style="padding:14px 20px;font-size:14px">${phone || "—"}</td>
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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("claim-listing error:", err);
    return NextResponse.json({ error: "Failed to send. Please try again." }, { status: 500 });
  }
}
