"use client";

import { PaletteColor } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  palette: PaletteColor[];
  selectedColor: string | null;
  onSelectColor: (hex: string) => void;
}

export default function ColorPalette({ palette, selectedColor, onSelectColor }: Props) {
  return (
    <div className="flex flex-col gap-2 p-3 bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-stone-100">
      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider px-1">Color palette</p>
      <div className="grid grid-cols-4 gap-2">
        {palette.map((color) => {
          const isSelected = selectedColor === color.hex;
          return (
            <button
              key={color.number}
              onClick={() => onSelectColor(color.hex)}
              title={`${color.number}. ${color.name}`}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-xl p-1.5 border-2 transition-all",
                isSelected
                  ? "border-stone-700 scale-110 shadow-md"
                  : "border-transparent hover:border-stone-300"
              )}
            >
              <div
                className="w-8 h-8 rounded-lg shadow-inner border border-stone-100"
                style={{ backgroundColor: color.hex }}
              />
              <span className="text-[9px] font-bold text-stone-500">{color.number}</span>
            </button>
          );
        })}
      </div>
      {selectedColor && (
        <p className="text-center text-xs text-stone-400 mt-1">
          Tap a numbered region to fill
        </p>
      )}
    </div>
  );
}
