"use client";

import type { Category, Project } from "@/lib/types";
import {
  LayoutGrid,
  Briefcase,
  Heart,
  BookOpen,
  FlaskConical,
  Star,
  Zap,
  Pause,
  CheckCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Briefcase,
  Heart,
  BookOpen,
  FlaskConical,
};

type Props = {
  categories: Category[];
  projects: Project[];
  selected: string;
  onSelect: (id: string) => void;
  onReset: () => void;
};

export function CategoryRail({ categories, projects, selected, onSelect, onReset }: Props) {
  const countByCategory = (catId: string) =>
    projects.filter((p) => p.category_id === catId).length;
  const totalCount = projects.length;
  const activeCount = projects.filter((p) => p.status === "active").length;
  const pausedCount = projects.filter((p) => p.status === "paused").length;
  const doneCount = projects.filter((p) => p.status === "done").length;

  return (
    <aside className="w-56 bg-white border-r border-slate-200 flex flex-col shrink-0 hidden md:flex">
      <div className="flex gap-2 p-3 border-b border-slate-200">
        <button
          className="flex-1 h-9 text-xs font-semibold bg-cyan-100 hover:bg-cyan-200 text-cyan-700 rounded transition-colors"
          aria-label="โฟกัส / Focus"
        >
          <span className="block leading-tight">โฟกัส</span>
          <span className="block leading-tight text-[10px] opacity-80">Focus</span>
        </button>
        <button
          onClick={onReset}
          className="flex-1 h-9 text-xs font-semibold bg-rose-100 hover:bg-rose-200 text-rose-700 rounded transition-colors"
          aria-label="รีเซ็ต / Reset"
        >
          <span className="block leading-tight">รีเซ็ต</span>
          <span className="block leading-tight text-[10px] opacity-80">Reset</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        <RailItem
          icon={LayoutGrid}
          active={selected === "all"}
          onClick={() => onSelect("all")}
          count={totalCount}
          title_th="ทั้งหมด"
          title_en="All Projects"
        />
        <RailItem
          icon={Zap}
          active={selected === "active"}
          onClick={() => onSelect("active")}
          count={activeCount}
          title_th="กำลังทำ"
          title_en="Active"
          accent="emerald"
        />
        <RailItem
          icon={Pause}
          active={selected === "paused"}
          onClick={() => onSelect("paused")}
          count={pausedCount}
          title_th="พัก"
          title_en="Paused"
          accent="amber"
        />
        <RailItem
          icon={CheckCircle2}
          active={selected === "done"}
          onClick={() => onSelect("done")}
          count={doneCount}
          title_th="เสร็จแล้ว"
          title_en="Done"
          accent="slate"
        />
        <RailItem
          icon={Star}
          active={selected === "pinned"}
          onClick={() => onSelect("pinned")}
          count={0}
          title_th="ปักหมุด"
          title_en="Pinned"
        />

        <div className="px-3 mt-5 mb-1 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
          หมวดหมู่ · Categories
        </div>

        {categories.map((cat) => {
          const Icon = iconMap[cat.icon] ?? LayoutGrid;
          return (
            <RailItem
              key={cat.id}
              icon={Icon}
              active={selected === cat.id}
              onClick={() => onSelect(cat.id)}
              count={countByCategory(cat.id)}
              title_th={cat.name_th}
              title_en={cat.name_en}
            />
          );
        })}
      </div>
    </aside>
  );
}

type RailItemProps = {
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
  count: number;
  title_th: string;
  title_en: string;
  accent?: "emerald" | "amber" | "slate";
};

function RailItem({ icon: Icon, active, onClick, count, title_th, title_en, accent }: RailItemProps) {
  const iconColor = accent === "emerald"
    ? "text-emerald-500"
    : accent === "amber"
    ? "text-amber-500"
    : accent === "slate"
    ? "text-slate-400"
    : active ? "text-cyan-600" : "text-slate-500";

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
        active
          ? "bg-cyan-50 text-cyan-700 border-r-2 border-cyan-500"
          : "text-slate-700 hover:bg-slate-50 border-r-2 border-transparent"
      }`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${active ? "text-cyan-600" : iconColor}`} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium leading-tight truncate">{title_th}</div>
        <div className="text-[10px] text-slate-500 leading-tight truncate">{title_en}</div>
      </div>
      <span
        className={`text-xs font-semibold tabular-nums ${
          active ? "text-cyan-700" : "text-slate-400"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
