"use client";

const KEY = (pageId: string) => `colorbook_progress_${pageId}`;

export interface Progress {
  filledRegions: Record<string, string>;
  completionPercent: number;
  lastSaved: string;
}

export function loadProgress(pageId: string): Progress {
  if (typeof window === "undefined") return { filledRegions: {}, completionPercent: 0, lastSaved: "" };
  try {
    const raw = localStorage.getItem(KEY(pageId));
    return raw ? JSON.parse(raw) : { filledRegions: {}, completionPercent: 0, lastSaved: "" };
  } catch {
    return { filledRegions: {}, completionPercent: 0, lastSaved: "" };
  }
}

export function saveProgress(pageId: string, filledRegions: Record<string, string>, regionCount: number) {
  if (typeof window === "undefined") return;
  const completionPercent = regionCount > 0
    ? Math.round((Object.keys(filledRegions).length / regionCount) * 100)
    : 0;
  const progress: Progress = {
    filledRegions,
    completionPercent,
    lastSaved: new Date().toISOString(),
  };
  localStorage.setItem(KEY(pageId), JSON.stringify(progress));
  return completionPercent;
}

export function getAllProgress(): Record<string, Progress> {
  if (typeof window === "undefined") return {};
  const result: Record<string, Progress> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("colorbook_progress_")) {
      const pageId = key.replace("colorbook_progress_", "");
      try { result[pageId] = JSON.parse(localStorage.getItem(key)!); } catch {}
    }
  }
  return result;
}

export function clearProgress(pageId: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY(pageId));
}
