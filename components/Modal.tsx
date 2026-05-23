"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  title_th: string;
  title_en: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
};

export function Modal({ open, onClose, title_th, title_en, children, size = "md" }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizeClass = size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-2xl" : "max-w-md";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={`relative bg-white rounded-lg shadow-2xl w-full ${sizeClass} max-h-[90vh] flex flex-col`}
      >
        <div className="flex items-start justify-between p-5 border-b border-slate-200 shrink-0">
          <div>
            <h2 id="modal-title" className="text-base font-semibold text-slate-900 leading-tight">
              {title_th}
            </h2>
            <p className="text-xs text-slate-500 leading-tight">{title_en}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded hover:bg-slate-100 flex items-center justify-center text-slate-500"
            aria-label="ปิด / Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">{children}</div>
      </div>
    </div>
  );
}
