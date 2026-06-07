export interface PageMeta {
  id: string;
  title: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  svgUrl: string;
  palette: { number: number; hex: string; name: string }[];
}

// Loaded dynamically from /public/data/pages.json at runtime
export async function loadPages(): Promise<PageMeta[]> {
  const res = await fetch("/data/pages.json", { cache: "force-cache" });
  if (!res.ok) return [];
  return res.json();
}

export async function loadPage(id: string): Promise<PageMeta | null> {
  const pages = await loadPages();
  return pages.find((p) => p.id === id) ?? null;
}
