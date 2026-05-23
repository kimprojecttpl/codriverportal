"use client";

import { useState, useRef, useMemo } from "react";
import { X } from "lucide-react";

type Props = {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
};

export function TagInput({ value, onChange, suggestions = [], placeholder }: Props) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = input.trim().toLowerCase();
    if (!q) return suggestions.filter((s) => !value.includes(s)).slice(0, 8);
    return suggestions
      .filter((s) => s.toLowerCase().includes(q) && !value.includes(s))
      .slice(0, 8);
  }, [input, suggestions, value]);

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase();
    if (!tag) return;
    if (value.includes(tag)) {
      setInput("");
      return;
    }
    onChange([...value, tag]);
    setInput("");
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && input === "" && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  }

  return (
    <div className="relative">
      <div
        className="flex flex-wrap items-center gap-1 min-h-[2.5rem] px-2 py-1 bg-white border border-slate-300 rounded-md focus-within:ring-2 focus-within:ring-cyan-500 focus-within:border-cyan-500"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-rose-600"
              aria-label={`Remove tag ${tag}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] h-7 text-sm outline-none border-0 bg-transparent placeholder:text-slate-400"
        />
      </div>
      {focused && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
          {filtered.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                addTag(s);
              }}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
