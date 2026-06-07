import Link from "next/link";
import { Palette, Smartphone, Music, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream">
      <nav className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="flex items-center gap-2 font-bold text-stone-700">
            <Palette size={20} className="text-sage" /> ColorBook
          </span>
          <Link
            href="/gallery"
            className="bg-sage text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-sage/90 transition-colors"
          >
            Start coloring →
          </Link>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto px-4 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-sage/10 text-sage text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <Sparkles size={14} /> 100 free pages · S-Pen optimized
        </div>
        <h1 className="text-5xl font-bold text-stone-800 leading-tight mb-4">
          Color your calm.<br />
          <span className="text-sage">One stroke at a time.</span>
        </h1>
        <p className="text-lg text-stone-500 max-w-xl mx-auto mb-8">
          100 paint-by-numbers coloring pages for adults. Completely free.
          Designed for Samsung S-Pen — unwind with ambient music.
        </p>
        <Link
          href="/gallery"
          className="inline-block bg-sage text-white font-semibold px-10 py-4 rounded-full hover:bg-sage/90 transition-colors text-base shadow-lg shadow-sage/20"
        >
          Browse 100 coloring pages
        </Link>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { icon: <Smartphone size={24} className="text-sage" />, title: "S-Pen precision", desc: "Pressure-sensitive S-Pen drawing. Tap or swipe to fill regions." },
            { icon: <Palette size={24} className="text-warm" />, title: "100 unique pages", desc: "Mandalas, nature, animals, geometric patterns and more." },
            { icon: <Music size={24} className="text-blush" />, title: "Calm soundtrack", desc: "Ambient music plays while you color. Completely free, no sign-up." },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <div className="mb-3">{f.icon}</div>
              <h3 className="font-bold text-stone-700 mb-1">{f.title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-stone-200 py-8 text-center text-sm text-stone-400">
        © {new Date().getFullYear()} ColorBook · Free paint-by-numbers for S-Pen
      </footer>
    </div>
  );
}
