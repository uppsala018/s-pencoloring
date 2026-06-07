export interface ColorRegion {
  id: string;
  colorNumber: number;
  targetColor: string; // hex
  pathData: string;    // SVG path d attribute
  label?: string;
}

export interface ColoringPage {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  regionCount: number;
  isFree: boolean;
  svgUrl: string;       // Firebase Storage URL
  thumbnailUrl: string;
  palette: PaletteColor[];
  createdAt: string;
}

export interface PaletteColor {
  number: number;
  hex: string;
  name: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  plan: "free" | "credits" | "unlimited";
  credits: number;
  completedPages: string[];
  createdAt: string;
}

export interface ColoringProgress {
  pageId: string;
  userId: string;
  filledRegions: Record<string, string>; // regionId → hex color applied
  completionPercent: number;
  lastSaved: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  src: string;
}
