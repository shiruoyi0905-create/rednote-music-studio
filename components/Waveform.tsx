"use client";

type WaveformProps = {
  isPlaying: boolean;
};

const BARS = 28;

export default function Waveform({ isPlaying }: WaveformProps) {
  return (
    <div
      className="flex h-10 items-end justify-center gap-[3px]"
      aria-hidden
    >
      {Array.from({ length: BARS }).map((_, i) => (
        <span
          key={i}
          className={`wave-bar w-[3px] rounded-full ${
            isPlaying ? "wave-bar-active" : "wave-bar-idle"
          }`}
          style={{
            animationDelay: `${(i % 7) * 0.08}s`,
            height: isPlaying ? undefined : `${8 + (i % 5) * 3}px`,
          }}
        />
      ))}
    </div>
  );
}
