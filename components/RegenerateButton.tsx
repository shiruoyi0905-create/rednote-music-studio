"use client";

import { motion } from "framer-motion";

type RegenerateButtonProps = {
  onClick: () => void;
  label?: string;
  loading?: boolean;
  disabled?: boolean;
};

export default function RegenerateButton({
  onClick,
  label = "重新生成",
  loading = false,
  disabled = false,
}: RegenerateButtonProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={label}
      className="copy-btn shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-normal leading-none transition disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
          生成中
        </span>
      ) : (
        `↻ ${label}`
      )}
    </motion.button>
  );
}
