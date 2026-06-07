import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase-admin";
import Stripe from "stripe";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  // TODO: Set STRIPE_WEBHOOK_SECRET after registering the webhook endpoint in Stripe dashboard
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const type = session.metadata?.type;

      if (!userId) return NextResponse.json({ ok: true });

      const userRef = adminDb.collection("users").doc(userId);

      if (type === "credits") {
        const credits = Number(session.metadata?.credits ?? 10);
        await userRef.update({
          credits: FieldValue.increment(credits),
          plan: "credits",
        });
      } else if (type === "unlimited") {
        await userRef.update({ plan: "unlimited" });
      }
    }

    if (event.type === "customer.subscription.deleted") {
      // Subscription cancelled — revert to free
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (userId) {
        await adminDb.collection("users").doc(userId).update({ plan: "free" });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }
}

// App Router reads body as text() manually — no bodyParser config needed
