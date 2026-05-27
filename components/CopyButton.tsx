"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type CopyButtonProps = {
  text: string;
  label?: string;
};

export default function CopyButton({ text, label = "复制" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleCopy}
      whileTap={{ scale: 0.96 }}
      className="copy-btn shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-normal leading-none transition"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={copied ? "ok" : "copy"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="inline-block"
        >
          {copied ? "已复制" : label}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
