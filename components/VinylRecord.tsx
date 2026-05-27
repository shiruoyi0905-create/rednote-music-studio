"use client";

import { motion } from "framer-motion";

type VinylRecordProps = {
  isPlaying: boolean;
  coverGradient: string;
  song: string;
  artist: string;
};

export default function VinylRecord({
  isPlaying,
  coverGradient,
  song,
  artist,
}: VinylRecordProps) {
  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        className="relative h-[220px] w-[220px] sm:h-[240px] sm:w-[240px]"
        animate={{ rotate: isPlaying ? 360 : 0 }}
        transition={
          isPlaying
            ? { duration: 8, repeat: Infinity, ease: "linear" }
            : { duration: 0.6, ease: "easeOut" }
        }
      >
        {/* Outer glow */}
        <div className="vinyl-outer-glow absolute -inset-3 rounded-full blur-2xl" />

        {/* Vinyl disc */}
        <div className="vinyl-disc-shadow relative h-full w-full rounded-full bg-[#0a0a0a]">
          {/* Grooves */}
          <div
            className="absolute inset-2 rounded-full opacity-60"
            style={{
              background: `repeating-radial-gradient(
                circle at center,
                transparent 0px,
                transparent 2px,
                rgba(255,255,255,0.03) 2px,
                rgba(255,255,255,0.03) 3px
              )`,
            }}
          />
          <div className="absolute inset-6 rounded-full border border-white/5" />
          <div className="absolute inset-10 rounded-full border border-white/[0.03]" />
          <div className="absolute inset-14 rounded-full border border-white/[0.02]" />

          {/* Center label + cover */}
          <div className="absolute left-1/2 top-1/2 flex h-[88px] w-[88px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#1a1a1a] p-[3px] shadow-inner sm:h-[96px] sm:w-[96px]">
            <div
              className="relative h-full w-full overflow-hidden rounded-full ring-2 ring-white/10"
              style={{ background: coverGradient }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="select-none text-[10px] font-bold uppercase tracking-widest text-white/90 drop-shadow-md">
                  {song.slice(0, 6).toUpperCase() || "MUSIC"}
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/30" />
            </div>
            <div className="absolute h-3 w-3 rounded-full bg-[#121212] ring-2 ring-white/20" />
          </div>

          {/* Shine */}
          <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 via-transparent to-transparent" />
        </div>
      </motion.div>

      <div className="mt-5 text-center">
        <p className="u-text-primary text-sm font-semibold tracking-wide">
          {song}
        </p>
        <p className="u-text-muted mt-1 text-xs">{artist}</p>
      </div>
    </div>
  );
}
