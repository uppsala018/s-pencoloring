"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, SkipForward, Music } from "lucide-react";

// Royalty-free ambient tracks from Pixabay (free for commercial use)
const TRACKS = [
  {
    id: "1",
    title: "Gentle Stream",
    src: "https://cdn.pixabay.com/audio/2022/03/10/audio_c8a1d29f18.mp3",
  },
  {
    id: "2",
    title: "Forest Dawn",
    src: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3",
  },
  {
    id: "3",
    title: "Soft Piano",
    src: "https://cdn.pixabay.com/audio/2024/02/28/audio_cd6fb26f3e.mp3",
  },
];

export default function AudioPlayer() {
  const [playing, setPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(TRACKS[trackIndex].src);
    audio.volume = 0.35;
    audioRef.current = audio;

    const onEnded = () => setTrackIndex((i) => (i + 1) % TRACKS.length);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.pause();
      audio.src = "";
    };
  }, [trackIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [playing]);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-stone-100">
      <Music size={13} className="text-stone-400 shrink-0" />
      <span className="text-xs text-stone-500 truncate max-w-[90px] hidden sm:block">
        {TRACKS[trackIndex].title}
      </span>
      <button
        onClick={() => setPlaying((p) => !p)}
        className="text-stone-600 hover:text-stone-900 transition-colors"
        aria-label={playing ? "Pause music" : "Play music"}
      >
        {playing ? <Volume2 size={17} /> : <VolumeX size={17} />}
      </button>
      <button
        onClick={() => setTrackIndex((i) => (i + 1) % TRACKS.length)}
        className="text-stone-400 hover:text-stone-600 transition-colors"
        aria-label="Next track"
      >
        <SkipForward size={15} />
      </button>
    </div>
  );
}
