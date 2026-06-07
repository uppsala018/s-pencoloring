"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { ColoringPage } from "@/types";
import PageCard from "@/components/PageCard";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Search } from "lucide-react";

const CATEGORIES = ["All", "Nature", "Animals", "Spiritual", "Mandalas", "Fantasy"];

export default function GalleryPage() {
  const { profile } = useAuth();
  const [pages, setPages] = useState<ColoringPage[]>([]);
  const [filtered, setFiltered] = useState<ColoringPage[]>([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const snap = await getDocs(query(collection(db, "coloringPages"), orderBy("createdAt", "desc")));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ColoringPage));
      setPages(data);
      setFiltered(data);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    let result = pages;
    if (category !== "All") result = result.filter((p) => p.category === category);
    if (search) result = result.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [category, search, pages]);

  function isUnlocked(page: ColoringPage): boolean {
    if (page.isFree) return true;
    if (!profile) return false;
    if (profile.plan === "unlimited") return true;
    if (profile.completedPages?.includes(page.id)) return true;
    return profile.credits > 0;
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-stone-700">Coloring Gallery</h1>
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

        {/* Category filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                category === cat
                  ? "bg-sage text-white"
                  : "bg-white text-stone-600 border border-stone-200 hover:border-sage"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square bg-stone-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            <p>No pages found.</p>
            {!profile && (
              <Link href="/auth" className="mt-3 inline-block text-sage font-medium underline">
                Sign in to access all pages
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filtered.map((page) => (
              <PageCard key={page.id} page={page} isUnlocked={isUnlocked(page)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
