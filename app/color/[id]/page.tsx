"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { ColoringPage, ColoringProgress } from "@/types";
import ColorPalette from "@/components/ColorPalette";
import AudioPlayer from "@/components/AudioPlayer";
import ProgressBar from "@/components/ProgressBar";
import { ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function ColorPage() {
  const { id } = useParams<{ id: string }>();
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [page, setPage] = useState<ColoringPage | null>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [filledRegions, setFilledRegions] = useState<Record<string, string>>({});
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [regionCount, setRegionCount] = useState(0);
  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRegionRef = useRef<string | null>(null);

  // Load page metadata
  useEffect(() => {
    async function load() {
      if (authLoading) return; // wait for auth to resolve

      const snap = await getDoc(doc(db, "coloringPages", id));
      if (!snap.exists()) { router.push("/gallery"); return; }
      const data = { id: snap.id, ...snap.data() } as ColoringPage;

      // Check access (only after auth has loaded)
      if (!data.isFree) {
        if (!profile) {
          router.push(`/subscribe?page=${id}`);
          return;
        }
        if (profile.plan !== "unlimited" && profile.credits <= 0) {
          router.push(`/subscribe?page=${id}`);
          return;
        }
      }

      setPage(data);

      // Fetch the SVG content
      const res = await fetch(data.svgUrl);
      if (res.ok) {
        const text = await res.text();
        setSvgContent(text);

        // Count regions from SVG
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(text, "image/svg+xml");
        const count = svgDoc.querySelectorAll("[data-region-id]").length;
        setRegionCount(count);
      }

      setLoading(false);
    }
    load();
  }, [id, router, profile, authLoading]);

  // Load user progress
  useEffect(() => {
    if (!user || !id) return;
    const progressRef = doc(db, "users", user.uid, "progress", id);
    const unsub = onSnapshot(progressRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as ColoringProgress;
        setFilledRegions(data.filledRegions ?? {});
        setCompletion(data.completionPercent ?? 0);
      }
    });
    return unsub;
  }, [user, id]);

  // Apply fill colors to SVG elements
  useEffect(() => {
    const container = svgContainerRef.current;
    if (!container) return;
    Object.entries(filledRegions).forEach(([regionId, color]) => {
      const el = container.querySelector(`[data-region-id="${regionId}"]`);
      if (el) (el as SVGElement).style.fill = color;
    });
  }, [filledRegions, svgContent]);

  const saveProgress = useCallback(
    async (filled: Record<string, string>) => {
      if (!user || !regionCount) return;
      const pct = Math.round((Object.keys(filled).length / regionCount) * 100);
      setCompletion(pct);
      await setDoc(doc(db, "users", user.uid, "progress", id), {
        pageId: id,
        userId: user.uid,
        filledRegions: filled,
        completionPercent: pct,
        lastSaved: new Date().toISOString(),
      }, { merge: true });
    },
    [user, id, regionCount]
  );

  const fillRegion = useCallback(
    (regionId: string, color: string) => {
      const container = svgContainerRef.current;
      const el = container?.querySelector(`[data-region-id="${regionId}"]`);
      if (el) (el as SVGElement).style.fill = color;

      setFilledRegions((prev) => {
        const next = { ...prev, [regionId]: color };
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => saveProgress(next), 8000);
        return next;
      });
    },
    [saveProgress]
  );

  // Wire up pointer events on the SVG container
  useEffect(() => {
    const container = svgContainerRef.current;
    if (!container || !svgContent) return;

    const onPointerDown = (e: PointerEvent) => {
      activeRegionRef.current = null;
      if (!selectedColor) return;
      const target = e.target as SVGElement;
      const regionId = target.dataset?.regionId;
      if (!regionId) return;
      activeRegionRef.current = regionId;
      fillRegion(regionId, selectedColor);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.buttons === 0) return;
      if (e.pointerType === "pen" && e.pressure === 0) return;
      if (!selectedColor) return;
      const target = document.elementFromPoint(e.clientX, e.clientY) as SVGElement | null;
      const regionId = target?.dataset?.regionId;
      if (!regionId || regionId === activeRegionRef.current) return;
      activeRegionRef.current = regionId;
      fillRegion(regionId, selectedColor);
    };

    const onPointerUp = () => { activeRegionRef.current = null; };

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerUp);
    return () => {
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerUp);
    };
  }, [svgContent, selectedColor, fillRegion]);

  const handleReset = () => {
    if (!confirm("Reset all progress on this page?")) return;
    const container = svgContainerRef.current;
    if (container) {
      container.querySelectorAll("[data-region-id]").forEach((el) => {
        (el as SVGElement).style.fill = "#ffffff";
      });
    }
    setFilledRegions({});
    saveProgress({});
  };

  // Select first color by default
  useEffect(() => {
    if (page?.palette?.length && !selectedColor) {
      setSelectedColor(page.palette[0].hex);
    }
  }, [page, selectedColor]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-sage border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!page) return null;

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/gallery" className="text-stone-500 hover:text-stone-700">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-stone-700 text-sm truncate">{page.title}</h1>
            <ProgressBar percent={completion} className="mt-0.5 max-w-[200px]" />
          </div>
          <AudioPlayer />
          <button onClick={handleReset} title="Reset" className="text-stone-400 hover:text-stone-600">
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-2 py-4 gap-4">
        {/* SVG Canvas */}
        <div
          className="flex-1 bg-white rounded-2xl shadow-sm border border-stone-100 overflow-auto canvas-container min-h-[70vw] lg:min-h-0 flex items-center justify-center"
          style={{ touchAction: "none", cursor: selectedColor ? "crosshair" : "default" }}
        >
          {svgContent ? (
            <div
              ref={svgContainerRef}
              className="w-full h-full svg-coloring-container"
              dangerouslySetInnerHTML={{ __html: svgContent }}
              style={{ touchAction: "none" }}
            />
          ) : (
            <div className="text-stone-400 text-sm">Loading page…</div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:w-64 flex flex-col gap-3">
          {!user && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
              <Link href="/auth" className="font-semibold underline">Sign in</Link> to save your progress.
            </div>
          )}
          <ColorPalette
            palette={page.palette}
            selectedColor={selectedColor}
            onSelectColor={setSelectedColor}
          />
          <div className="text-center text-xs text-stone-400">
            {completion}% complete
          </div>
          {completion === 100 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center text-sm text-green-700 font-medium">
              🎨 Masterpiece complete!
            </div>
          )}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-500 space-y-1">
            <p className="font-semibold text-stone-600">S-Pen tips</p>
            <p>Tap a numbered region to fill it with your selected color.</p>
            <p>Swipe across regions to fill multiple at once.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
