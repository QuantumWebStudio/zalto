"use client";

import { useEffect } from "react";

/**
 * Content mounts after the initial paint on a fresh page load only in the
 * sense that layout can shift slightly as fonts/images settle, so the
 * browser's native fragment scroll (on load) can land a few pixels off.
 * Redo it once on mount to make deep links to a section reliable.
 */
export function ScrollToHash() {
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView();
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return null;
}
