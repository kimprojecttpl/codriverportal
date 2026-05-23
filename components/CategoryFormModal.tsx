"use client";

import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { Loader2 } from "lucide-react";
import type { Category, CategoryInput } from "@/lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CategoryInput) => Promise<void>;
  initial?: Category | null;
  categories: Category[];
};

const ICON_OPTIONS = [
  "LayoutGrid",
  "Briefcase",
  "Heart",
  "BookOpen",
  "FlaskConical",
  "Code",
  "Palette",
  "Music",
  "Camera",
  "Globe",
  "Star",
  "Zap",
];

export function CategoryFormModal({ open, onClose, onSubmit, initial, categories }: Props) {
  const [form, setForm] = useState<CategoryInput>({
    name_th: "",
    name_en: "",
    icon: "LayoutGrid",
    parent_id: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        name_th: initial.name_th,
        name_en: initial.name_en,
        icon: initial.icon,
        parent_id: initial.parent_id,
      });
    } else {
      setForm({ name_th: "", name_en: "", icon: "LayoutGrid", parent_id: null });
    }
    setError(null);
  }, [open, initial]);

  // Available parents: top-level categories (parent_id === null), excluding self
  // Also exclude categories that have children if we're editing (can't move parent under another)
  const possibleParents = categories.filter((c) => {
    if (c.parent_id !== null) return false;
    if (initial && c.id === initial.id) return false;
    if (initial) {
      const hasChildren = categories.some((x) => x.parent_id === initial.id);
      if (hasChildren) return false;
    }
    return true;
  });

  // If editing a category that has children, lock parent_id to null
  const hasChildren = initial
    ? categories.some((c) => c.parent_id === initial.id)
    : false;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit(form);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title_th={initial ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}
      title_en={initial ? "Edit Category" : "New Category"}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            ชื่อ (ไทย) <span className="text-slate-400 font-normal">/ Name (Thai)</span>
            <span className="text-rose-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            value={form.name_th}
            onChange={(e) => setForm({ ...form, name_th: e.target.value })}
            required
            className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            ชื่อ (English) <span className="text-slate-400 font-normal">/ Name (English)</span>
            <span className="text-rose-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            value={form.name_en}
            onChange={(e) => setForm({ ...form, name_en: e.target.value })}
            required
            className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            ไอคอน <span className="text-slate-400 font-normal">/ Icon</span>
          </label>
          <select
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          >
            {ICON_OPTIONS.map((icon) => (
              <option key={icon} value={icon}>
                {icon}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            หมวดแม่ <span className="text-slate-400 font-normal">/ Parent category (optional)</span>
          </label>
          <select
            value={form.parent_id ?? ""}
            onChange={(e) => setForm({ ...form, parent_id: e.target.value || null })}
            disabled={hasChildren}
            className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-slate-50 disabled:text-slate-500"
          >
            <option value="">— ไม่มี / None (top-level) —</option>
            {possibleParents.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_th} / {c.name_en}
              </option>
            ))}
          </select>
          {hasChildren && (
            <p className="text-[10px] text-slate-500 mt-1">
              หมวดนี้มี sub-category อยู่ — ไม่สามารถเปลี่ยนเป็น child ได้
              <br />
              This category has children — cannot be made a child itself
            </p>
          )}
        </div>

        {error && (
          <div className="text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-10 border border-slate-300 hover:bg-slate-50 text-sm font-medium rounded-md text-slate-700"
          >
            ยกเลิก / Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 h-10 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-400 text-white text-sm font-medium rounded-md flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {initial ? "บันทึก / Save" : "เพิ่ม / Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
