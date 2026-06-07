"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadPage, PageMeta } from "@/lib/pages-data";
import { loadProgress, saveProgress } from "@/lib/progress";
import ColorPalette from "@/components/ColorPalette";
import AudioPlayer from "@/components/AudioPlayer";
import ProgressBar from "@/components/ProgressBar";
import { ArrowLeft, RotateCcw, Palette } from "lucide-react";
import Link from "next/link";

export default function ColorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [page, setPage] = useState<PageMeta | null>(null);
  const [svgContent, setSvgContent] = useState("");
  const [filledRegions, setFilledRegions] = useState<Record<string, string>>({});
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [regionCount, setRegionCount] = useState(0);
  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const activeRegionRef = useRef<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load page + SVG
  useEffect(() => {
    async function load() {
      const meta = await loadPage(id);
      if (!meta) { router.push("/gallery"); return; }
      setPage(meta);

      const res = await fetch(meta.svgUrl);
      if (res.ok) {
        const text = await res.text();
        setSvgContent(text);
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "image/svg+xml");
        setRegionCount(doc.querySelectorAll("[data-region-id]").length);
      }

      const saved = loadProgress(id);
      setFilledRegions(saved.filledRegions);
      setCompletion(saved.completionPercent);
      setLoading(false);
    }
    load();
  }, [id, router]);

  // Apply saved colors to SVG after render
  useEffect(() => {
    const container = svgContainerRef.current;
    if (!container || !svgContent) return;
    Object.entries(filledRegions).forEach(([regionId, color]) => {
      const el = container.querySelector(`[data-region-id="${regionId}"]`) as SVGElement | null;
      if (el) el.style.fill = color;
    });
  }, [svgContent, filledRegions]);

  const fillRegion = useCallback((regionId: string, color: string) => {
    const el = svgContainerRef.current?.querySelector(
      `[data-region-id="${regionId}"]`
    ) as SVGElement | null;
    if (el) el.style.fill = color;

    setFilledRegions((prev) => {
      const next = { ...prev, [regionId]: color };
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        const pct = saveProgress(id, next, regionCount) ?? 0;
        setCompletion(pct);
      }, 5000);
      return next;
    });
  }, [id, regionCount]);

  // S-Pen / pointer events
  useEffect(() => {
    const container = svgContainerRef.current;
    if (!container || !svgContent) return;

    const onDown = (e: PointerEvent) => {
      activeRegionRef.current = null;
      if (!selectedColor) return;
      const target = e.target as SVGElement;
      const rid = target.dataset?.regionId;
      if (!rid) return;
      activeRegionRef.current = rid;
      fillRegion(rid, selectedColor);
    };

    const onMove = (e: PointerEvent) => {
      if (e.buttons === 0) return;
      if (e.pointerType === "pen" && e.pressure === 0) return;
      if (!selectedColor) return;
      const el = document.elementFromPoint(e.clientX, e.clientY) as SVGElement | null;
      const rid = el?.dataset?.regionId;
      if (!rid || rid === activeRegionRef.current) return;
      activeRegionRef.current = rid;
      fillRegion(rid, selectedColor);
    };

    const onUp = () => { activeRegionRef.current = null; };

    container.addEventListener("pointerdown", onDown);
    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerup", onUp);
    return () => {
      container.removeEventListener("pointerdown", onDown);
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerup", onUp);
    };
  }, [svgContent, selectedColor, fillRegion]);

  const handleReset = () => {
    if (!confirm("Reset all progress on this page?")) return;
    svgContainerRef.current?.querySelectorAll("[data-region-id]").forEach((el) => {
      (el as SVGElement).style.fill = "#ffffff";
    });
    setFilledRegions({});
    setCompletion(0);
    saveProgress(id, {}, regionCount);
  };

  // Save on unmount
  useEffect(() => () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setFilledRegions((prev) => {
      saveProgress(id, prev, regionCount);
      return prev;
    });
  }, [id, regionCount]);

  useEffect(() => {
    if (page?.palette?.length && !selectedColor) setSelectedColor(page.palette[0].hex);
  }, [page, selectedColor]);

  if (loading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-sage border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!page) return null;

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/gallery" className="text-stone-500 hover:text-stone-700">
            <ArrowLeft size={20} />
          </Link>
          <Palette size={16} className="text-sage shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-stone-700 text-sm truncate">{page.title}</p>
            <ProgressBar percent={completion} className="mt-0.5 max-w-[160px]" />
          </div>
          <AudioPlayer />
          <button onClick={handleReset} title="Reset" className="text-stone-400 hover:text-stone-600 ml-1">
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-2 py-4 gap-4">
        {/* Canvas */}
        <div
          className="flex-1 bg-white rounded-2xl shadow-sm border border-stone-100 overflow-auto canvas-container flex items-center justify-center min-h-[70vw] lg:min-h-0"
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
            <div className="text-stone-400 text-sm">Loading…</div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:w-60 flex flex-col gap-3">
          <ColorPalette
            palette={page.palette}
            selectedColor={selectedColor}
            onSelectColor={setSelectedColor}
          />
          <div className="text-center text-xs text-stone-400">{completion}% complete</div>
          {completion === 100 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center text-sm text-green-700 font-semibold">
              🎨 Masterpiece complete!
            </div>
          )}
          <div className="bg-stone-50 border border-stone-100 rounded-xl p-3 text-xs text-stone-500 space-y-1">
            <p className="font-semibold text-stone-600">Tips</p>
            <p>Select a color, then tap any region to fill it.</p>
            <p>Drag your S-Pen across regions to fill multiple at once.</p>
            <p>Progress saves automatically.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
