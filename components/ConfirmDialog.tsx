"use client";

import { Modal } from "./Modal";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title_th: string;
  title_en: string;
  message_th: string;
  message_en: string;
  confirmLabel_th?: string;
  confirmLabel_en?: string;
  danger?: boolean;
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title_th,
  title_en,
  message_th,
  message_en,
  confirmLabel_th = "ยืนยัน",
  confirmLabel_en = "Confirm",
  danger = false,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title_th={title_th} title_en={title_en} size="sm">
      <div className="p-5 space-y-4">
        <div className="flex items-start gap-3">
          {danger && (
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
          )}
          <div>
            <p className="text-sm text-slate-700">{message_th}</p>
            <p className="text-xs text-slate-500 mt-1">{message_en}</p>
          </div>
        </div>

        {error && (
          <div className="text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-9 border border-slate-300 hover:bg-slate-50 text-sm font-medium rounded-md text-slate-700"
          >
            ยกเลิก / Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 h-9 text-white text-sm font-medium rounded-md flex items-center justify-center gap-2 ${
              danger
                ? "bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400"
                : "bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-400"
            }`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel_th} / {confirmLabel_en}
          </button>
        </div>
      </div>
    </Modal>
  );
}
