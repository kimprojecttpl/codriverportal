"use client";

import type { Category, ProjectWithTags } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { ExternalLink, Plus, Pin } from "lucide-react";

type Props = {
  projects: ProjectWithTags[];
  categories: Category[];
  onRowClick: (p: ProjectWithTags) => void;
  onLaunch: (p: ProjectWithTags) => void;
  onAddNew: () => void;
};

function formatRelative(iso: string | null): { th: string; en: string } {
  if (!iso) return { th: "ไม่เคย", en: "Never" };
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (hours < 1) return { th: "เมื่อสักครู่", en: "Just now" };
  if (hours < 24) return { th: `${hours} ชม.ที่แล้ว`, en: `${hours}h ago` };
  if (days < 7) return { th: `${days} วันที่แล้ว`, en: `${days}d ago` };
  return {
    th: d.toLocaleDateString("th-TH", { day: "numeric", month: "short" }),
    en: d.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
  };
}

export function ProjectsTable({
  projects,
  categories,
  onRowClick,
  onLaunch,
  onAddNew,
}: Props) {
  const getCat = (id: string | null) =>
    id ? categories.find((c) => c.id === id) : undefined;

  if (projects.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-12 bg-white">
        <div className="text-5xl mb-4">📭</div>
        <div className="text-base font-semibold text-slate-700">ยังไม่มีโครงการ</div>
        <div className="text-xs text-slate-500 mt-1 mb-5">
          No projects yet — adjust filters or add a new one
        </div>
        <button
          onClick={onAddNew}
          className="flex items-center gap-2 h-10 px-4 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded-md"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มโครงการแรก / Add first project</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-white scrollbar-thin">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
          <tr className="text-left text-slate-500">
            <th className="w-12 px-4 py-3 font-semibold text-[11px] uppercase tracking-wider">
              #
            </th>
            <th className="w-10 px-2 py-3"></th>
            <th className="px-2 py-3">
              <div className="text-[11px] uppercase tracking-wider font-semibold">ชื่อโครงการ</div>
              <div className="text-[10px] text-slate-400 font-normal">Name</div>
            </th>
            <th className="px-2 py-3 w-40">
              <div className="text-[11px] uppercase tracking-wider font-semibold">หมวดหมู่</div>
              <div className="text-[10px] text-slate-400 font-normal">Category</div>
            </th>
            <th className="px-2 py-3 w-44">
              <div className="text-[11px] uppercase tracking-wider font-semibold">สถานะ</div>
              <div className="text-[10px] text-slate-400 font-normal">Status</div>
            </th>
            <th className="px-2 py-3 w-56">
              <div className="text-[11px] uppercase tracking-wider font-semibold">แท็ก</div>
              <div className="text-[10px] text-slate-400 font-normal">Tags</div>
            </th>
            <th className="px-2 py-3 w-32">
              <div className="text-[11px] uppercase tracking-wider font-semibold">เข้าใช้ล่าสุด</div>
              <div className="text-[10px] text-slate-400 font-normal">Last accessed</div>
            </th>
            <th className="px-4 py-3 w-14"></th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p, i) => {
            const cat = getCat(p.category_id);
            const last = formatRelative(p.last_accessed_at);
            return (
              <tr
                key={p.id}
                onClick={() => onRowClick(p)}
                className="border-b border-slate-100 hover:bg-cyan-50/40 cursor-pointer group transition-colors"
              >
                <td className="px-4 py-3 text-slate-400 tabular-nums text-xs">{i + 1}</td>
                <td className="px-2 py-3 text-2xl text-center select-none relative" aria-hidden>
                  {p.icon ?? "📁"}
                  {p.pinned && (
                    <Pin className="absolute top-2 right-0 w-3 h-3 text-amber-500 fill-amber-500" />
                  )}
                </td>
                <td className="px-2 py-3">
                  <div className="font-medium text-slate-900 leading-tight">{p.name_th}</div>
                  <div className="text-xs text-slate-500 leading-tight">{p.name_en}</div>
                </td>
                <td className="px-2 py-3">
                  {cat ? (
                    <div>
                      <div className="text-sm text-slate-700 leading-tight">{cat.name_th}</div>
                      <div className="text-[10px] text-slate-400 leading-tight">{cat.name_en}</div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400">ไม่ระบุ / Uncategorized</div>
                  )}
                </td>
                <td className="px-2 py-3">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-2 py-3">
                  <div className="flex flex-wrap gap-1">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-2 py-3 text-xs">
                  <div className="text-slate-700 leading-tight">{last.th}</div>
                  <div className="text-[10px] text-slate-400 leading-tight">{last.en}</div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLaunch(p);
                    }}
                    className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded transition-all"
                    title="เปิดในแท็บใหม่ / Open in new tab"
                    aria-label="Open project URL"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
