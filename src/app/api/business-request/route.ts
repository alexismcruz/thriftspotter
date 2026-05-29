import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const body = await req.json();
    const { businessName, address, city, state, phone, email, website, instagram, facebook, other } = body;

    if (!businessName || !city || !state || !phone) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const lines = [
      `Business Name: ${businessName}`,
      `Address: ${address}`,
      `City: ${city}`,
      `State: ${state}`,
      `Phone: ${phone}`,
      email ? `Email: ${email}` : null,
      website   ? `Website: ${website}`   : null,
      instagram ? `Instagram: ${instagram}` : null,
      facebook  ? `Facebook: ${facebook}`  : null,
      other     ? `Other Social: ${other}` : null,
    ].filter(Boolean).join("\n");

    await resend.emails.send({
      from: "ThriftSpotter <noreply@thriftspotter.com>",
      to: "hello@thriftspotter.com",
      replyTo: email || undefined,
      subject: "New Business Listing Request",
      text: `A business owner has requested to be listed on ThriftSpotter.\n\n${lines}`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to send. Please try again." }, { status: 500 });
  }
}
