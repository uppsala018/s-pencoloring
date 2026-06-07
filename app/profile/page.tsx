"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { ColoringProgress } from "@/types";
import Navbar from "@/components/Navbar";
import ProgressBar from "@/components/ProgressBar";
import { Crown, Zap, Palette } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [progressList, setProgressList] = useState<ColoringProgress[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push("/auth");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const snap = await getDocs(collection(db, "users", user!.uid, "progress"));
      setProgressList(snap.docs.map((d) => d.data() as ColoringProgress));
    }
    load();
  }, [user]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sage border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const planLabel = profile.plan === "unlimited" ? "Unlimited" : profile.plan === "credits" ? "Credits" : "Free";
  const planIcon = profile.plan === "unlimited" ? <Crown size={14} /> : <Zap size={14} />;

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-stone-700">{profile.displayName ?? profile.email}</h1>
              <p className="text-sm text-stone-400 mt-0.5">{profile.email}</p>
            </div>
            <span className="flex items-center gap-1.5 bg-sage/10 text-sage text-xs font-semibold px-3 py-1 rounded-full">
              {planIcon} {planLabel}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-stone-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-stone-700">{profile.credits}</p>
              <p className="text-xs text-stone-400 mt-0.5">Credits</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-stone-700">{progressList.length}</p>
              <p className="text-xs text-stone-400 mt-0.5">Pages started</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-stone-700">
                {progressList.filter((p) => p.completionPercent === 100).length}
              </p>
              <p className="text-xs text-stone-400 mt-0.5">Completed</p>
            </div>
          </div>

          {profile.plan !== "unlimited" && (
            <Link
              href="/subscribe"
              className="mt-4 block text-center text-sm font-medium bg-sage text-white py-2.5 rounded-xl hover:bg-sage/90 transition-colors"
            >
              Upgrade plan
            </Link>
          )}
        </div>

        {progressList.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-stone-600 mb-3 flex items-center gap-2">
              <Palette size={16} /> My colorings
            </h2>
            <div className="space-y-3">
              {progressList.map((p) => (
                <Link
                  key={p.pageId}
                  href={`/color/${p.pageId}`}
                  className="flex items-center gap-4 bg-white rounded-xl p-4 border border-stone-100 hover:border-sage transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-700 truncate">Page {p.pageId}</p>
                    <ProgressBar percent={p.completionPercent} className="mt-1.5" />
                  </div>
                  <span className="text-xs text-stone-400 whitespace-nowrap">{p.completionPercent}%</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
