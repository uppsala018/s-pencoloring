import Link from "next/link";
import { Palette } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="text-center">
        <Palette size={48} className="text-sage mx-auto mb-4 opacity-50" />
        <h1 className="text-4xl font-bold text-stone-700 mb-2">404</h1>
        <p className="text-stone-500 mb-6">This page hasn&apos;t been colored in yet.</p>
        <Link
          href="/"
          className="bg-sage text-white px-6 py-2.5 rounded-full font-medium hover:bg-sage/90 transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
