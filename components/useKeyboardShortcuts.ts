"use client";

import { useEffect } from "react";

type Shortcuts = {
  onSearch?: () => void;
  onNew?: () => void;
  onEscape?: () => void;
};

export function useKeyboardShortcuts({ onSearch, onNew, onEscape }: Shortcuts) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (e.key === "Escape" && onEscape) {
        onEscape();
        return;
      }

      if (isTyping) return;

      if (e.key === "/" && onSearch) {
        e.preventDefault();
        onSearch();
      } else if (e.key === "n" && onNew && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onNew();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onSearch, onNew, onEscape]);
}
