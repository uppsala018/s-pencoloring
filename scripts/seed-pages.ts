/**
 * Run with: npx ts-node --project tsconfig.json scripts/seed-pages.ts
 *
 * Seeds Firestore with 5 starter coloring pages.
 * Make sure FIREBASE_ADMIN_PRIVATE_KEY etc. are in your .env.local
 */

import * as admin from "firebase-admin";
import * as path from "path";
import * as fs from "fs";

// Load .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf8");
envContent.split("\n").forEach((line) => {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) process.env[key.trim()] = rest.join("=").trim().replace(/^"|"$/g, "");
});

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

const PAGES = [
  {
    title: "Noah's Ark & Rainbow",
    description: "A peaceful scene of Noah's Ark sailing under a majestic rainbow",
    category: "Spiritual",
    difficulty: "medium",
    isFree: true,
    palette: [
      { number: 1, hex: "#87CEEB", name: "Sky Blue" },
      { number: 2, hex: "#4A90D9", name: "Ocean Blue" },
      { number: 3, hex: "#8B6914", name: "Wood Brown" },
      { number: 4, hex: "#5C8A3C", name: "Forest Green" },
      { number: 5, hex: "#E8C547", name: "Sun Gold" },
      { number: 6, hex: "#D4524A", name: "Coral Red" },
      { number: 7, hex: "#9B6B9B", name: "Lavender" },
      { number: 8, hex: "#F5F0E8", name: "Cloud White" },
      { number: 9, hex: "#A0522D", name: "Sienna" },
      { number: 10, hex: "#2E8B57", name: "Sea Green" },
    ],
    svgFile: "noahs-ark.svg",
  },
  {
    title: "Enchanted Forest",
    description: "Tall ancient trees with mushrooms, ferns, and hidden woodland creatures",
    category: "Nature",
    difficulty: "hard",
    isFree: false,
    palette: [
      { number: 1, hex: "#228B22", name: "Forest Green" },
      { number: 2, hex: "#90EE90", name: "Light Green" },
      { number: 3, hex: "#8B4513", name: "Brown" },
      { number: 4, hex: "#D2B48C", name: "Tan" },
      { number: 5, hex: "#FF6B6B", name: "Mushroom Red" },
      { number: 6, hex: "#FFD700", name: "Sunbeam" },
      { number: 7, hex: "#87CEEB", name: "Sky" },
      { number: 8, hex: "#F5F5DC", name: "Cream" },
      { number: 9, hex: "#808000", name: "Olive" },
      { number: 10, hex: "#DDA0DD", name: "Plum" },
    ],
    svgFile: "enchanted-forest.svg",
  },
  {
    title: "Ocean Serenity",
    description: "Gentle waves, coral reef, and colorful fish beneath a setting sun",
    category: "Nature",
    difficulty: "medium",
    isFree: false,
    palette: [
      { number: 1, hex: "#006994", name: "Deep Ocean" },
      { number: 2, hex: "#40B4E5", name: "Turquoise" },
      { number: 3, hex: "#FF8C00", name: "Sunset Orange" },
      { number: 4, hex: "#FFD700", name: "Gold" },
      { number: 5, hex: "#FF6347", name: "Coral" },
      { number: 6, hex: "#98FB98", name: "Pale Green" },
      { number: 7, hex: "#E0F7FA", name: "Foam White" },
      { number: 8, hex: "#FF69B4", name: "Pink Coral" },
      { number: 9, hex: "#800080", name: "Deep Purple" },
      { number: 10, hex: "#F4A460", name: "Sandy" },
    ],
    svgFile: "ocean-serenity.svg",
  },
  {
    title: "Mandala of Peace",
    description: "Intricate symmetrical mandala with flowing petals and geometric patterns",
    category: "Mandalas",
    difficulty: "hard",
    isFree: false,
    palette: [
      { number: 1, hex: "#C471ED", name: "Violet" },
      { number: 2, hex: "#F64F59", name: "Rose" },
      { number: 3, hex: "#F7971E", name: "Saffron" },
      { number: 4, hex: "#FFD200", name: "Golden" },
      { number: 5, hex: "#56CCF2", name: "Cerulean" },
      { number: 6, hex: "#6FCF97", name: "Mint" },
      { number: 7, hex: "#EB5757", name: "Vermilion" },
      { number: 8, hex: "#2F80ED", name: "Royal Blue" },
      { number: 9, hex: "#F2994A", name: "Amber" },
      { number: 10, hex: "#FFFFFF", name: "White" },
    ],
    svgFile: "mandala-peace.svg",
  },
  {
    title: "Garden in Bloom",
    description: "A blooming cottage garden with roses, lavender, and butterflies",
    category: "Nature",
    difficulty: "easy",
    isFree: false,
    palette: [
      { number: 1, hex: "#FF85A1", name: "Rose Pink" },
      { number: 2, hex: "#B39DDB", name: "Lavender" },
      { number: 3, hex: "#A5D6A7", name: "Leaf Green" },
      { number: 4, hex: "#FFF176", name: "Buttercup" },
      { number: 5, hex: "#80CBC4", name: "Teal" },
      { number: 6, hex: "#FF7043", name: "Poppy" },
      { number: 7, hex: "#5C6BC0", name: "Bluebell" },
      { number: 8, hex: "#8D6E63", name: "Earth" },
      { number: 9, hex: "#F8BBD0", name: "Petal" },
      { number: 10, hex: "#C8E6C9", name: "Sage" },
    ],
    svgFile: "garden-bloom.svg",
  },
];

async function seed() {
  console.log("Seeding coloring pages…");
  for (const page of PAGES) {
    const svgPath = path.resolve(process.cwd(), "public", "coloring-pages", page.svgFile);
    const svgExists = fs.existsSync(svgPath);

    const docRef = db.collection("coloringPages").doc();
    await docRef.set({
      title: page.title,
      description: page.description,
      category: page.category,
      difficulty: page.difficulty,
      isFree: page.isFree,
      palette: page.palette,
      regionCount: 0,
      svgUrl: `/coloring-pages/${page.svgFile}`,
      thumbnailUrl: `/thumbnails/${page.svgFile.replace(".svg", ".jpg")}`,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: svgExists ? "ready" : "pending_svg",
    });
    console.log(`  ✓ ${page.title} (${docRef.id})`);
  }
  console.log("Done.");
  process.exit(0);
}

seed().catch(console.error);
