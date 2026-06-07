import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

export const PRICE_IDS = {
  credits: process.env.STRIPE_CREDITS_PRICE_ID ?? "",
  unlimited: process.env.STRIPE_UNLIMITED_PRICE_ID ?? "",
};

export const CREDITS_PER_PACK = 10;
