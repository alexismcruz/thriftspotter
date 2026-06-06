import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

/**
 * eBay Marketplace Account Deletion Notification Endpoint
 * Required by eBay for all developer accounts (privacy compliance)
 *
 * GET  — eBay sends a challenge code, we must respond with a SHA-256 hash
 * POST — eBay notifies us when a user deletes their account
 */

// GET: Endpoint verification (eBay sends challengeCode, we echo it back hashed)
export async function GET(req: NextRequest) {
  const challengeCode = req.nextUrl.searchParams.get("challenge_code");
  const verificationToken = process.env.EBAY_VERIFICATION_TOKEN;
  const endpoint = "https://www.thriftspotter.com/api/ebay/account-deletion";

  if (!challengeCode) {
    return NextResponse.json({ error: "Missing challenge_code" }, { status: 400 });
  }

  if (!verificationToken) {
    return NextResponse.json({ error: "Missing EBAY_VERIFICATION_TOKEN env var" }, { status: 500 });
  }

  // eBay requires: SHA-256(challengeCode + verificationToken + endpoint)
  const hash = createHash("sha256")
    .update(challengeCode + verificationToken + endpoint)
    .digest("hex");

  return NextResponse.json({ challengeResponse: hash });
}

// POST: Handle account deletion notifications
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // ThriftSpotter does not store eBay user data, so nothing to delete.
    // Log the notification for compliance records.
    console.log("eBay account deletion notification received:", JSON.stringify(body));
    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
