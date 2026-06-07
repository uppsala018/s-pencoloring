import Link from "next/link";
import { Palette } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-stone-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-stone-700">
          <Palette size={20} className="text-sage" />
          <span>ColorBook</span>
        </Link>
        <Link
          href="/gallery"
          className="text-sm font-medium bg-sage text-white px-4 py-1.5 rounded-full hover:bg-sage/90 transition-colors"
        >
          Gallery
        </Link>
      </div>
    </nav>
  );
}
