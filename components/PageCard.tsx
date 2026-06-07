import Link from "next/link";
import Image from "next/image";
import { Lock, Star } from "lucide-react";
import { ColoringPage } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  page: ColoringPage;
  isUnlocked: boolean;
}

const difficultyColor = {
  easy: "text-green-600 bg-green-50",
  medium: "text-amber-600 bg-amber-50",
  hard: "text-red-600 bg-red-50",
};

export default function PageCard({ page, isUnlocked }: Props) {
  return (
    <Link href={isUnlocked ? `/color/${page.id}` : `/subscribe?page=${page.id}`}>
      <div className="group relative rounded-2xl overflow-hidden bg-white shadow-sm border border-stone-100 hover:shadow-md transition-shadow cursor-pointer">
        <div className="relative aspect-square bg-stone-50">
          <Image
            src={page.thumbnailUrl}
            alt={page.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 33vw"
          />
          {!isUnlocked && (
            <div className="absolute inset-0 bg-stone-900/40 flex items-center justify-center">
              <Lock size={28} className="text-white" />
            </div>
          )}
          {page.isFree && (
            <span className="absolute top-2 left-2 bg-sage text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              FREE
            </span>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-stone-700 text-sm leading-tight truncate">{page.title}</h3>
          <div className="flex items-center justify-between mt-1.5">
            <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", difficultyColor[page.difficulty])}>
              {page.difficulty}
            </span>
            <span className="text-[10px] text-stone-400">{page.regionCount} regions</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
