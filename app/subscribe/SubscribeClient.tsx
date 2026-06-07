"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Crown, Zap, Check } from "lucide-react";
import Link from "next/link";

export default function SubscribeClient() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnPage = searchParams.get("page");
  const [loading, setLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleCheckout(type: "credits" | "unlimited") {
    if (!user) { router.push("/auth"); return; }
    setLoading(type);
    setErrorMsg("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          userId: user.uid,
          returnPage,
          idToken: await user.getIdToken(),
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setErrorMsg(data.error ?? "Checkout failed");
      }
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-stone-800 text-center mb-2">Unlock more pages</h1>
        <p className="text-stone-500 text-center mb-12">
          Choose the plan that fits your coloring habit.
        </p>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 text-center">
            {errorMsg}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Credits */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={20} className="text-amber-500" />
              <h2 className="text-lg font-bold text-stone-700">Credit Pack</h2>
            </div>
            <p className="text-3xl font-bold text-stone-800 mb-1">€2.99</p>
            <p className="text-sm text-stone-500 mb-6">10 credits · one-time</p>
            <ul className="space-y-2 mb-6">
              {["10 coloring pages", "Never expires", "Any category"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-stone-600">
                  <Check size={14} className="text-sage" /> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleCheckout("credits")}
              disabled={!!loading}
              className="w-full bg-amber-500 text-white font-semibold py-2.5 rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-60"
            >
              {loading === "credits" ? "Redirecting…" : "Buy credits"}
            </button>
          </div>

          {/* Unlimited */}
          <div className="bg-sage text-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Crown size={20} />
              <h2 className="text-lg font-bold">Unlimited</h2>
            </div>
            <p className="text-3xl font-bold mb-1">€4.99</p>
            <p className="text-sm opacity-70 mb-6">per month · cancel anytime</p>
            <ul className="space-y-2 mb-6">
              {["All pages unlocked", "New pages every week", "Priority support", "Future features included"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check size={14} /> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleCheckout("unlimited")}
              disabled={!!loading}
              className="w-full bg-white text-sage font-semibold py-2.5 rounded-xl hover:bg-stone-50 transition-colors disabled:opacity-60"
            >
              {loading === "unlimited" ? "Redirecting…" : "Go Unlimited"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-stone-400 mt-8">
          Secure payment via Stripe · Cancel anytime
        </p>

        {profile?.plan === "unlimited" && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-center text-sm text-green-700">
            You already have an Unlimited subscription.{" "}
            <Link href="/gallery" className="font-semibold underline">Back to gallery →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
