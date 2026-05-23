"use client";

import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { TagInput } from "./TagInput";
import { Loader2 } from "lucide-react";
import type { Category, ProjectInput, ProjectStatus, ProjectWithTags } from "@/lib/types";
import { buildCategoryTree } from "@/lib/db";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: ProjectInput) => Promise<void>;
  categories: Category[];
  tagSuggestions: string[];
  initial?: ProjectWithTags | null;
};

const emptyInput: ProjectInput = {
  name_th: "",
  name_en: "",
  url: "",
  category_id: null,
  status: "active",
  description_th: "",
  description_en: "",
  icon: "📁",
  tags: [],
};

export function ProjectFormModal({
  open,
  onClose,
  onSubmit,
  categories,
  tagSuggestions,
  initial,
}: Props) {
  const [form, setForm] = useState<ProjectInput>(emptyInput);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        name_th: initial.name_th,
        name_en: initial.name_en,
        url: initial.url,
        category_id: initial.category_id,
        status: initial.status,
        description_th: initial.description_th,
        description_en: initial.description_en,
        icon: initial.icon ?? "📁",
        tags: initial.tags,
      });
    } else {
      setForm({
        ...emptyInput,
        category_id: categories[0]?.id ?? null,
      });
    }
    setError(null);
  }, [open, initial, categories]);

  function update<K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!form.url.match(/^https?:\/\//)) {
        throw new Error("URL ต้องขึ้นต้นด้วย http:// หรือ https:// / URL must start with http:// or https://");
      }
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
      title_th={initial ? "แก้ไขโครงการ" : "เพิ่มโครงการใหม่"}
      title_en={initial ? "Edit Project" : "New Project"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label_th="ชื่อ (ไทย)" label_en="Name (Thai)" required>
            <input
              type="text"
              value={form.name_th}
              onChange={(e) => update("name_th", e.target.value)}
              required
              className={inputClass}
            />
          </Field>
          <Field label_th="ชื่อ (English)" label_en="Name (English)" required>
            <input
              type="text"
              value={form.name_en}
              onChange={(e) => update("name_en", e.target.value)}
              required
              className={inputClass}
            />
          </Field>
        </div>

        <Field label_th="URL ของโครงการ" label_en="Project URL" required>
          <input
            type="url"
            value={form.url}
            onChange={(e) => update("url", e.target.value)}
            placeholder="https://example.com"
            required
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label_th="หมวดหมู่" label_en="Category" required>
            <select
              value={form.category_id ?? ""}
              onChange={(e) => update("category_id", e.target.value || null)}
              required
              className={inputClass}
            >
              <option value="" disabled>
                -- เลือก / Select --
              </option>
              {buildCategoryTree(categories).flatMap((parent) => [
                <option key={parent.id} value={parent.id}>
                  {parent.name_th} / {parent.name_en}
                </option>,
                ...parent.children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {"    └ "}
                    {child.name_th} / {child.name_en}
                  </option>
                )),
              ])}
            </select>
          </Field>
          <Field label_th="สถานะ" label_en="Status">
            <select
              value={form.status}
              onChange={(e) => update("status", e.target.value as ProjectStatus)}
              className={inputClass}
            >
              <option value="active">กำลังทำ / Active</option>
              <option value="paused">พัก / Paused</option>
              <option value="done">เสร็จแล้ว / Done</option>
            </select>
          </Field>
          <Field label_th="ไอคอน" label_en="Icon (emoji)">
            <input
              type="text"
              value={form.icon ?? ""}
              onChange={(e) => update("icon", e.target.value)}
              placeholder="📁"
              maxLength={4}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label_th="แท็ก" label_en="Tags (press Enter or comma to add)">
          <TagInput
            value={form.tags}
            onChange={(tags) => update("tags", tags)}
            suggestions={tagSuggestions}
            placeholder="พิมพ์แท็ก แล้วกด Enter..."
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label_th="คำอธิบาย (ไทย)" label_en="Description (Thai)">
            <textarea
              value={form.description_th}
              onChange={(e) => update("description_th", e.target.value)}
              rows={3}
              className={`${inputClass} resize-y`}
            />
          </Field>
          <Field label_th="คำอธิบาย (English)" label_en="Description (English)">
            <textarea
              value={form.description_en}
              onChange={(e) => update("description_en", e.target.value)}
              rows={3}
              className={`${inputClass} resize-y`}
            />
          </Field>
        </div>

        {error && (
          <div className="text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex gap-2 pt-3 border-t border-slate-100">
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

const inputClass =
  "w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500";

function Field({
  label_th,
  label_en,
  required,
  children,
}: {
  label_th: string;
  label_en: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">
        {label_th} <span className="text-slate-400 font-normal">/ {label_en}</span>
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
