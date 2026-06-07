import Link from "next/link";
import { Palette, Smartphone, Music, Lock, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-sage/10 text-sage text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <Sparkles size={14} /> S-Pen optimized
        </div>
        <h1 className="text-5xl font-bold text-stone-800 leading-tight mb-4">
          Color your calm.<br />
          <span className="text-sage">One stroke at a time.</span>
        </h1>
        <p className="text-lg text-stone-500 max-w-xl mx-auto mb-8">
          Paint-by-numbers coloring pages designed for adults. Unwind with your Samsung S-Pen
          and gentle ambient music.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/gallery"
            className="bg-sage text-white font-semibold px-8 py-3.5 rounded-full hover:bg-sage/90 transition-colors text-base"
          >
            Browse coloring pages
          </Link>
          <Link
            href="/auth"
            className="bg-white text-stone-700 font-semibold px-8 py-3.5 rounded-full border border-stone-200 hover:border-stone-300 transition-colors text-base"
          >
            Create free account
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: <Smartphone size={24} className="text-sage" />,
              title: "S-Pen precision",
              desc: "Every stroke is tracked with pressure sensitivity. Your Galaxy S-Pen is the perfect brush.",
            },
            {
              icon: <Palette size={24} className="text-warm" />,
              title: "Paint by numbers",
              desc: "Hundreds of numbered regions per image. Follow the palette or go freehand — your choice.",
            },
            {
              icon: <Music size={24} className="text-blush" />,
              title: "Ambient soundscapes",
              desc: "Stream calming royalty-free music while you color. Made for deep relaxation.",
            },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <div className="mb-3">{f.icon}</div>
              <h3 className="font-bold text-stone-700 mb-1">{f.title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <h2 className="text-2xl font-bold text-stone-700 text-center mb-8">Simple pricing</h2>
        <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {[
            {
              name: "Free",
              price: "€0",
              desc: "Try it out",
              features: ["1 free coloring page", "Basic palette", "Save progress"],
              cta: "Get started",
              href: "/auth",
              highlight: false,
            },
            {
              name: "Credits",
              price: "€2.99",
              desc: "per 10 pages",
              features: ["Buy as you go", "All image categories", "Save progress"],
              cta: "Buy credits",
              href: "/subscribe",
              highlight: false,
            },
            {
              name: "Unlimited",
              price: "€4.99",
              desc: "per month",
              features: ["All pages unlocked", "New pages weekly", "Priority support"],
              cta: "Go unlimited",
              href: "/subscribe",
              highlight: true,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 border ${
                plan.highlight
                  ? "bg-sage text-white border-sage shadow-lg scale-105"
                  : "bg-white text-stone-700 border-stone-100 shadow-sm"
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-70">{plan.name}</p>
              <p className="text-3xl font-bold mb-0.5">{plan.price}</p>
              <p className="text-sm opacity-70 mb-4">{plan.desc}</p>
              <ul className="space-y-1.5 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm flex items-center gap-2">
                    <span className="opacity-60">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`block text-center text-sm font-semibold py-2.5 rounded-full transition-colors ${
                  plan.highlight
                    ? "bg-white text-sage hover:bg-stone-50"
                    : "bg-sage text-white hover:bg-sage/90"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-stone-200 py-8 text-center text-sm text-stone-400">
        © {new Date().getFullYear()} ColorBook · Made with ♥ for S-Pen users
      </footer>
    </div>
  );
}
