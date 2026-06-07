"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { ColorRegion, PaletteColor } from "@/types";

interface Props {
  regions: ColorRegion[];
  palette: PaletteColor[];
  filledRegions: Record<string, string>;
  selectedColor: string | null;
  onRegionFill: (regionId: string, color: string) => void;
  viewBox: string;
}

export default function ColoringCanvas({
  regions,
  filledRegions,
  selectedColor,
  onRegionFill,
  viewBox,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const activeRegionRef = useRef<string | null>(null);
  const [labelPositions, setLabelPositions] = useState<Record<string, { x: number; y: number }>>({});

  // Compute label positions after SVG renders
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const positions: Record<string, { x: number; y: number }> = {};
    svg.querySelectorAll("[data-region-id]").forEach((el) => {
      const regionId = (el as SVGElement).dataset.regionId!;
      if (!regionId || filledRegions[regionId]) return;
      try {
        const bbox = (el as SVGGraphicsElement).getBBox();
        positions[regionId] = {
          x: bbox.x + bbox.width / 2,
          y: bbox.y + bbox.height / 2,
        };
      } catch {
        // getBBox may fail for non-rendered elements
      }
    });
    setLabelPositions(positions);
  }, [regions, filledRegions]);

  const handleRegionInteraction = useCallback(
    (e: PointerEvent) => {
      if (!selectedColor) return;
      const target = e.target as SVGElement;
      const regionId = target.dataset.regionId;
      if (!regionId || regionId === activeRegionRef.current) return;
      activeRegionRef.current = regionId;
      onRegionFill(regionId, selectedColor);
    },
    [selectedColor, onRegionFill]
  );

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const onPointerDown = (e: PointerEvent) => {
      svg.setPointerCapture(e.pointerId);
      activeRegionRef.current = null;
      handleRegionInteraction(e);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.buttons === 0) return;
      if (e.pointerType === "pen" && e.pressure === 0) return;
      handleRegionInteraction(e);
    };
    const onPointerUp = () => {
      activeRegionRef.current = null;
    };

    svg.addEventListener("pointerdown", onPointerDown);
    svg.addEventListener("pointermove", onPointerMove);
    svg.addEventListener("pointerup", onPointerUp);
    return () => {
      svg.removeEventListener("pointerdown", onPointerDown);
      svg.removeEventListener("pointermove", onPointerMove);
      svg.removeEventListener("pointerup", onPointerUp);
    };
  }, [handleRegionInteraction]);

  return (
    <svg
      ref={svgRef}
      viewBox={viewBox}
      className="w-full h-full canvas-container select-none"
      style={{ touchAction: "none" }}
    >
      {regions.map((region) => {
        const filled = filledRegions[region.id];
        const pos = labelPositions[region.id];
        return (
          <g key={region.id}>
            <path
              d={region.pathData}
              fill={filled ?? "#ffffff"}
              stroke="#333"
              strokeWidth="1.5"
              strokeLinejoin="round"
              className="region-path"
              data-region-id={region.id}
              data-color-number={region.colorNumber}
            />
            {!filled && pos && (
              <text
                x={pos.x}
                y={pos.y + 4}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill="#666"
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {region.colorNumber}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
