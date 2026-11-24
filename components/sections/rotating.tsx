"use client";

import { useEffect, useState } from "react";

export function RotatingWords({ words, className = "text-[#b7d0c0]" }: { words: string[]; className?: string }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (words.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, 2600);
    return () => window.clearInterval(timer);
  }, [words]);

  if (words.length === 0) return null;
  return (
    <span className={`inline-grid ${className}`}>
      {words.map((word, wordIndex) => (
        <span
          key={word}
          className={
            wordIndex === index
              ? "ilm-word-in col-start-1 row-start-1"
              : "invisible col-start-1 row-start-1"
          }
          aria-hidden={wordIndex !== index}
        >
          {word}
        </span>
      ))}
    </span>
  );
}
