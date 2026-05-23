"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  fetchCategories,
  fetchTags,
  fetchProjects,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/db";
import type { Category, CategoryInput, ProjectWithTags, Tag } from "@/lib/types";
import { Sidebar } from "@/components/Sidebar";
import { CategoryFormModal } from "@/components/CategoryFormModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { LoadingState, ErrorState } from "@/components/LoadingState";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  LayoutGrid,
  Briefcase,
  Heart,
  BookOpen,
  FlaskConical,
  Code,
  Palette,
  Music,
  Camera,
  Globe,
  Star,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  LayoutGrid,
  Briefcase,
  Heart,
  BookOpen,
  FlaskConical,
  Code,
  Palette,
  Music,
  Camera,
  Globe,
  Star,
  Zap,
};

export default function SettingsPage() {
  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);
  const [categories, setCategories] = useState<Category[]>([]);
  const [projects, setProjects] = useState<ProjectWithTags[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const refetch = useCallback(async () => {
    if (!supabase) {
      setError("Supabase ยังไม่ได้ตั้งค่า / Supabase not configured");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [c, t, p] = await Promise.all([
        fetchCategories(supabase),
        fetchTags(supabase),
        fetchProjects(supabase),
      ]);
      setCategories(c);
      setTags(t);
      setProjects(p);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const countByCategory = (catId: string) =>
    projects.filter((p) => p.category_id === catId).length;

  const tagUsage = useMemo(() => {
    const usage = new Map<string, number>();
    for (const p of projects) {
      for (const t of p.tags) usage.set(t, (usage.get(t) ?? 0) + 1);
    }
    return usage;
  }, [projects]);

  async function handleCategorySubmit(input: CategoryInput) {
    if (!supabase) throw new Error("Supabase not configured");
    if (editTarget) {
      await updateCategory(supabase, editTarget.id, input);
    } else {
      await createCategory(supabase, input);
    }
    await refetch();
  }

  async function handleCategoryDelete() {
    if (!deleteTarget || !supabase) return;
    await deleteCategory(supabase, deleteTarget.id);
    await refetch();
  }

  if (loading) {
    return (
      <div className="h-screen flex bg-slate-50">
        <Sidebar />
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex bg-slate-50">
        <Sidebar />
        <ErrorState error={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto scrollbar-thin">
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3 sticky top-0 z-10">
          <Link
            href="/"
            className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-slate-100 text-slate-600"
            title="กลับ / Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">ตั้งค่า</h1>
            <p className="text-xs text-slate-500">Settings · Manage categories and tags</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto w-full p-6 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">หมวดหมู่</h2>
                <p className="text-xs text-slate-500">
                  Categories — group projects by purpose ({categories.length})
                </p>
              </div>
              <button
                onClick={() => {
                  setEditTarget(null);
                  setFormOpen(true);
                }}
                className="flex items-center gap-1.5 h-9 pl-2.5 pr-3 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded-md"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่ม / Add</span>
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              {categories.length === 0 ? (
                <div className="p-12 text-center text-sm text-slate-500">
                  ยังไม่มีหมวดหมู่ / No categories yet
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {categories.map((cat) => {
                    const Icon = iconMap[cat.icon] ?? LayoutGrid;
                    const count = countByCategory(cat.id);
                    return (
                      <li
                        key={cat.id}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
                      >
                        <div className="w-9 h-9 rounded bg-cyan-50 flex items-center justify-center text-cyan-600 shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-900 leading-tight">
                            {cat.name_th}
                          </div>
                          <div className="text-xs text-slate-500 leading-tight">
                            {cat.name_en}
                          </div>
                        </div>
                        <span className="text-xs text-slate-400 tabular-nums">
                          {count} โครงการ / projects
                        </span>
                        <button
                          onClick={() => {
                            setEditTarget(cat);
                            setFormOpen(true);
                          }}
                          className="w-8 h-8 rounded flex items-center justify-center hover:bg-slate-100 text-slate-500"
                          title="แก้ไข / Edit"
                          aria-label="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(cat)}
                          className="w-8 h-8 rounded flex items-center justify-center hover:bg-rose-50 text-slate-500 hover:text-rose-600"
                          title="ลบ / Delete"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>

          <section>
            <div className="mb-3">
              <h2 className="text-base font-semibold text-slate-900">แท็ก</h2>
              <p className="text-xs text-slate-500">
                Tags — created automatically when used in projects ({tags.length})
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4">
              {tags.length === 0 ? (
                <div className="text-sm text-slate-500 text-center py-6">
                  ยังไม่มีแท็ก — สร้างแท็กโดยใส่ในโครงการ
                  <br />
                  No tags yet — add tags via project form
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => {
                    const count = tagUsage.get(tag.name) ?? 0;
                    return (
                      <span
                        key={tag.id}
                        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded font-medium"
                      >
                        {tag.name}
                        <span className="text-[10px] text-slate-500 tabular-nums">×{count}</span>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="mb-3">
              <h2 className="text-base font-semibold text-slate-900">ข้อมูล</h2>
              <p className="text-xs text-slate-500">Account info</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4 text-xs space-y-2">
              <Row label_th="โครงการทั้งหมด" label_en="Total projects" value={projects.length.toString()} />
              <Row
                label_th="กำลังทำ"
                label_en="Active"
                value={projects.filter((p) => p.status === "active").length.toString()}
              />
              <Row
                label_th="พัก"
                label_en="Paused"
                value={projects.filter((p) => p.status === "paused").length.toString()}
              />
              <Row
                label_th="เสร็จแล้ว"
                label_en="Done"
                value={projects.filter((p) => p.status === "done").length.toString()}
              />
            </div>
          </section>
        </div>
      </div>

      <CategoryFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCategorySubmit}
        initial={editTarget}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleCategoryDelete}
        title_th="ลบหมวดหมู่"
        title_en="Delete Category"
        message_th={`ลบ "${deleteTarget?.name_th ?? ""}"? โครงการในหมวดนี้จะกลายเป็น "ไม่ระบุ"`}
        message_en={`Delete "${deleteTarget?.name_en ?? ""}"? Projects in this category will become "Uncategorized".`}
        confirmLabel_th="ลบ"
        confirmLabel_en="Delete"
        danger
      />
    </div>
  );
}

function Row({ label_th, label_en, value }: { label_th: string; label_en: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
      <div>
        <span className="text-slate-700 font-medium">{label_th}</span>
        <span className="text-slate-400"> · {label_en}</span>
      </div>
      <span className="font-semibold text-slate-900 tabular-nums">{value}</span>
    </div>
  );
}
