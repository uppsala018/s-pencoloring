import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const snap = await adminDb()
      .collection("coloringPages")
      .orderBy("createdAt", "desc")
      .get();

    const pages = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ pages });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load pages" }, { status: 500 });
  }
}
