import { NextRequest, NextResponse } from "next/server";
import { generateColoringImage } from "@/lib/replicate";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt) return NextResponse.json({ error: "prompt required" }, { status: 400 });
    const imageUrl = await generateColoringImage(prompt);
    return NextResponse.json({ imageUrl });
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
