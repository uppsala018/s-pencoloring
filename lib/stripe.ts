import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

// TODO: Set these after creating products in your new Stripe account
export const PRICE_IDS = {
  credits: process.env.STRIPE_CREDITS_PRICE_ID ?? "",   // one-time credit pack
  unlimited: process.env.STRIPE_UNLIMITED_PRICE_ID ?? "", // monthly subscription
};

export const CREDITS_PER_PACK = 10;
