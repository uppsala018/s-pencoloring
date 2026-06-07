"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-stone-700 mb-2">Something went wrong</h1>
        <p className="text-stone-500 mb-6 text-sm">{error.message}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-sage text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-sage/90 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="bg-white border border-stone-200 text-stone-600 px-5 py-2 rounded-full text-sm font-medium hover:border-stone-300 transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
