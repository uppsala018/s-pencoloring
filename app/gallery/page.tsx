"use client";

import { useEffect, useState } from "react";
import { loadPages, PageMeta } from "@/lib/pages-data";
import { getAllProgress } from "@/lib/progress";
import Link from "next/link";
import { Palette, Search } from "lucide-react";

const CATEGORIES = ["All", "Mandalas", "Nature", "Geometric", "Animals", "Fantasy"];

export default function GalleryPage() {
  const [pages, setPages] = useState<PageMeta[]>([]);
  const [filtered, setFiltered] = useState<PageMeta[]>([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    loadPages().then((data) => {
      setPages(data);
      setFiltered(data);
      setLoading(false);
    });
    const allProgress = getAllProgress();
    const pct: Record<string, number> = {};
    Object.entries(allProgress).forEach(([id, p]) => { pct[id] = p.completionPercent; });
    setProgress(pct);
  }, []);

  useEffect(() => {
    let result = pages;
    if (category !== "All") result = result.filter((p) => p.category === category);
    if (search) result = result.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [category, search, pages]);

  const diffColor = { easy: "text-green-600 bg-green-50", medium: "text-amber-600 bg-amber-50", hard: "text-red-600 bg-red-50" };

  return (
    <div className="min-h-screen bg-cream">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-stone-700">
            <Palette size={20} className="text-sage" /> ColorBook
          </Link>
          <span className="text-xs text-stone-400 hidden sm:block">100 free coloring pages · S-Pen optimized</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-stone-700">
            Coloring Gallery <span className="text-stone-400 font-normal text-lg">({filtered.length})</span>
          </h1>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search pages…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-4 py-2 border border-stone-200 rounded-full text-sm focus:outline-none focus:border-sage bg-white"
            />
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                category === cat ? "bg-sage text-white" : "bg-white text-stone-600 border border-stone-200 hover:border-sage"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="aspect-square bg-stone-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filtered.map((page) => {
              const pct = progress[page.id] ?? 0;
              return (
                <Link key={page.id} href={`/color/${page.id}`}>
                  <div className="group rounded-2xl overflow-hidden bg-white shadow-sm border border-stone-100 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="relative aspect-square bg-stone-50 flex items-center justify-center overflow-hidden">
                      <img
                        src={page.svgUrl}
                        alt={page.title}
                        className="w-full h-full object-contain p-2"
                        loading="lazy"
                      />
                      {pct > 0 && (
                        <div className="absolute bottom-1 left-1 right-1">
                          <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                            <div className="h-full bg-sage rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )}
                      {pct === 100 && (
                        <div className="absolute top-1.5 right-1.5 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          ✓ Done
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="font-medium text-stone-700 text-xs leading-tight truncate">{page.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${diffColor[page.difficulty]}`}>
                          {page.difficulty}
                        </span>
                        <span className="text-[9px] text-stone-400">{page.category}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
