import { NextRequest, NextResponse } from "next/server";
import { generateColoringImage } from "@/lib/replicate";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { prompt, title, category, idToken } = await req.json();

    const decoded = await adminAuth().verifyIdToken(idToken);
    const userDoc = await adminDb().collection("users").doc(decoded.uid).get();
    if (!userDoc.data()?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!prompt) return NextResponse.json({ error: "prompt required" }, { status: 400 });

    const imageUrl = await generateColoringImage(prompt);

    const ref = await adminDb().collection("coloringPages").add({
      title: title ?? prompt,
      description: prompt,
      category: category ?? "General",
      difficulty: "medium",
      regionCount: 0,
      isFree: false,
      svgUrl: "",
      thumbnailUrl: imageUrl,
      palette: [],
      createdAt: new Date().toISOString(),
      status: "pending_processing",
    });

    return NextResponse.json({ id: ref.id, imageUrl });
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
