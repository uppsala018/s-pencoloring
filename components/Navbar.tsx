"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { logOut } from "@/lib/auth";
import { Palette, User, LogOut, Crown } from "lucide-react";

export default function Navbar() {
  const { user, profile } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-stone-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-stone-700">
          <Palette size={20} className="text-sage" />
          <span>ColorBook</span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/gallery" className="text-sm text-stone-600 hover:text-stone-900">
                Gallery
              </Link>
              {profile && (
                <span className="text-xs bg-amber-50 text-amber-700 font-medium px-2 py-0.5 rounded-full border border-amber-200">
                  {profile.plan === "unlimited" ? (
                    <span className="flex items-center gap-1"><Crown size={10} /> Unlimited</span>
                  ) : (
                    `${profile.credits} credits`
                  )}
                </span>
              )}
              <Link href="/profile">
                <User size={20} className="text-stone-500 hover:text-stone-900" />
              </Link>
              <button onClick={logOut}>
                <LogOut size={18} className="text-stone-400 hover:text-stone-700" />
              </button>
            </>
          ) : (
            <>
              <Link href="/gallery" className="text-sm text-stone-600 hover:text-stone-900">
                Gallery
              </Link>
              <Link
                href="/auth"
                className="text-sm font-medium bg-sage text-white px-4 py-1.5 rounded-full hover:bg-sage/90 transition-colors"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
