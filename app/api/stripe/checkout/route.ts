import { NextRequest, NextResponse } from "next/server";
import { stripe, PRICE_IDS, CREDITS_PER_PACK } from "@/lib/stripe";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { type, idToken, returnPage } = await req.json();

    // Verify Firebase token
    const decoded = await adminAuth().verifyIdToken(idToken);
    const userId = decoded.uid;

    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin}/gallery?success=1${returnPage ? `&page=${returnPage}` : ""}`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin}/subscribe`;

    if (type === "credits") {
      if (!PRICE_IDS.credits) {
        return NextResponse.json({ error: "Credits price not configured yet. Please add STRIPE_CREDITS_PRICE_ID to environment." }, { status: 503 });
      }
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{ price: PRICE_IDS.credits, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { userId, type: "credits", credits: String(CREDITS_PER_PACK) },
      });
      return NextResponse.json({ url: session.url });
    }

    if (type === "unlimited") {
      if (!PRICE_IDS.unlimited) {
        return NextResponse.json({ error: "Subscription price not configured yet. Please add STRIPE_UNLIMITED_PRICE_ID to environment." }, { status: 503 });
      }
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: PRICE_IDS.unlimited, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { userId, type: "unlimited" },
      });
      return NextResponse.json({ url: session.url });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
