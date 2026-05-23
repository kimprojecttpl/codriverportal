"use client";

import type { Category, ProjectWithTags } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { X, ExternalLink, Edit2, Trash2, Pin, PinOff } from "lucide-react";

type Props = {
  project: ProjectWithTags | null;
  categories: Category[];
  onClose: () => void;
  onLaunch: (p: ProjectWithTags) => void;
  onEdit: (p: ProjectWithTags) => void;
  onDelete: (p: ProjectWithTags) => void;
  onTogglePin: (p: ProjectWithTags) => void;
};

export function DetailPanel({
  project,
  categories,
  onClose,
  onLaunch,
  onEdit,
  onDelete,
  onTogglePin,
}: Props) {
  if (!project) return null;
  const cat = categories.find((c) => c.id === project.category_id);

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/30 lg:hidden z-40"
        aria-hidden
      />
      <aside className="fixed lg:relative right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl lg:shadow-none flex flex-col z-50 lg:z-0">
        <div className="flex items-start justify-between p-5 border-b border-slate-200">
          <div className="flex items-start gap-3 min-w-0">
            <div className="text-3xl shrink-0 relative" aria-hidden>
              {project.icon ?? "📁"}
              {project.pinned && (
                <Pin className="absolute -top-1 -right-1 w-3 h-3 text-amber-500 fill-amber-500" />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-base font-semibold text-slate-900 leading-tight truncate">
                {project.name_th}
              </div>
              <div className="text-sm text-slate-500 leading-tight truncate">
                {project.name_en}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded hover:bg-slate-100 flex items-center justify-center text-slate-500 shrink-0"
            aria-label="ปิด / Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 border-b border-slate-200 space-y-3">
          <StatusBadge status={project.status} />
          <div className="flex gap-2">
            <button
              onClick={() => onLaunch(project)}
              className="flex-1 flex items-center justify-center gap-2 h-9 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>เปิด / Open</span>
            </button>
            <button
              onClick={() => onTogglePin(project)}
              className={`w-9 h-9 flex items-center justify-center border rounded-md transition-colors ${
                project.pinned
                  ? "border-amber-300 bg-amber-50 text-amber-600 hover:bg-amber-100"
                  : "border-slate-200 hover:bg-slate-50 text-slate-600"
              }`}
              title={project.pinned ? "ยกเลิกปักหมุด / Unpin" : "ปักหมุด / Pin"}
              aria-label={project.pinned ? "Unpin" : "Pin"}
            >
              {project.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onEdit(project)}
              className="w-9 h-9 flex items-center justify-center border border-slate-200 hover:bg-slate-50 rounded-md text-slate-600"
              title="แก้ไข / Edit"
              aria-label="แก้ไข / Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(project)}
              className="w-9 h-9 flex items-center justify-center border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-md text-slate-600 transition-colors"
              title="ลบ / Delete"
              aria-label="ลบ / Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
          <Field label_th="ลิงก์" label_en="URL">
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-600 hover:underline text-sm break-all"
            >
              {project.url}
            </a>
          </Field>

          <Field label_th="หมวดหมู่" label_en="Category">
            {cat ? (
              <div className="text-sm">
                <span className="text-slate-900">{cat.name_th}</span>
                <span className="text-slate-400"> · {cat.name_en}</span>
              </div>
            ) : (
              <div className="text-sm text-slate-400">ไม่ระบุ / Uncategorized</div>
            )}
          </Field>

          <Field label_th="แท็ก" label_en="Tags">
            {project.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {project.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-400">ไม่มีแท็ก / No tags</div>
            )}
          </Field>

          {project.description_th && (
            <Field label_th="คำอธิบาย (ไทย)" label_en="Description (Thai)">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {project.description_th}
              </p>
            </Field>
          )}

          {project.description_en && (
            <Field label_th="คำอธิบาย (English)" label_en="Description (English)">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {project.description_en}
              </p>
            </Field>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <Field label_th="สร้างเมื่อ" label_en="Created">
              <p className="text-xs text-slate-600 tabular-nums">
                {new Date(project.created_at).toLocaleDateString("th-TH")}
              </p>
            </Field>
            <Field label_th="แก้ไขล่าสุด" label_en="Updated">
              <p className="text-xs text-slate-600 tabular-nums">
                {new Date(project.updated_at).toLocaleDateString("th-TH")}
              </p>
            </Field>
          </div>
        </div>
      </aside>
    </>
  );
}

function Field({
  label_th,
  label_en,
  children,
}: {
  label_th: string;
  label_en: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
        {label_th} <span className="text-slate-400">· {label_en}</span>
      </div>
      {children}
    </div>
  );
}
