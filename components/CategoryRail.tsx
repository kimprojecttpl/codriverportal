"use client";

import type { Category, CategoryNode, Project } from "@/lib/types";
import { buildCategoryTree } from "@/lib/db";
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
  Code,
  Palette,
  Music,
  Camera,
  Globe,
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

type Props = {
  categories: Category[];
  projects: Project[];
  selected: string;
  onSelect: (id: string) => void;
  onReset: () => void;
};

export function CategoryRail({ categories, projects, selected, onSelect, onReset }: Props) {
  const tree = buildCategoryTree(categories);

  // Direct count — projects whose category_id matches exactly
  const directCount = (catId: string) =>
    projects.filter((p) => p.category_id === catId).length;

  // Rollup count for parent = own projects + all children's projects
  const rollupCount = (node: CategoryNode) =>
    directCount(node.id) + node.children.reduce((sum, c) => sum + directCount(c.id), 0);

  const totalCount = projects.length;
  const activeCount = projects.filter((p) => p.status === "active").length;
  const pausedCount = projects.filter((p) => p.status === "paused").length;
  const doneCount = projects.filter((p) => p.status === "done").length;
  const pinnedCount = projects.filter((p) => p.pinned).length;

  return (
    <aside className="w-56 bg-white/70 backdrop-blur-xl border-r border-slate-200/70 flex flex-col shrink-0 hidden md:flex">
      <div className="flex gap-2 p-3 border-b border-slate-200/70">
        <button
          className="flex-1 h-9 text-xs font-semibold bg-cyan-100 hover:bg-cyan-200 text-cyan-700 rounded-xl transition-all duration-200 ease-liquid hover:shadow-glow-cyan"
          aria-label="โฟกัส / Focus"
        >
          <span className="block leading-tight">โฟกัส</span>
          <span className="block leading-tight text-[10px] opacity-80">Focus</span>
        </button>
        <button
          onClick={onReset}
          className="flex-1 h-9 text-xs font-semibold bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl transition-all duration-200 ease-liquid"
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
          count={pinnedCount}
          title_th="ปักหมุด"
          title_en="Pinned"
        />

        <div className="px-3 mt-5 mb-1 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
          หมวดหมู่ · Categories
        </div>

        {tree.map((parent) => {
          const Icon = iconMap[parent.icon] ?? LayoutGrid;
          return (
            <div key={parent.id}>
              <RailItem
                icon={Icon}
                active={selected === parent.id}
                onClick={() => onSelect(parent.id)}
                count={rollupCount(parent)}
                title_th={parent.name_th}
                title_en={parent.name_en}
              />
              {parent.children.map((child) => {
                const ChildIcon = iconMap[child.icon] ?? LayoutGrid;
                return (
                  <RailItem
                    key={child.id}
                    icon={ChildIcon}
                    active={selected === child.id}
                    onClick={() => onSelect(child.id)}
                    count={directCount(child.id)}
                    title_th={child.name_th}
                    title_en={child.name_en}
                    indent
                  />
                );
              })}
            </div>
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
  indent?: boolean;
};

function RailItem({
  icon: Icon,
  active,
  onClick,
  count,
  title_th,
  title_en,
  accent,
  indent,
}: RailItemProps) {
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
      className={`group w-full flex items-center gap-2 ${indent ? "pl-7 pr-2 mx-2" : "px-2 mx-2"} py-1.5 my-0.5 text-left rounded-lg transition-all duration-200 ease-liquid ${
        active
          ? "bg-gradient-to-r from-cyan-50 to-cyan-100/40 text-cyan-700 shadow-glass"
          : "text-slate-700 hover:bg-slate-50 hover:translate-x-0.5"
      }`}
    >
      <Icon className={`${indent ? "w-3.5 h-3.5" : "w-4 h-4"} shrink-0 transition-colors ${active ? "text-cyan-600" : iconColor}`} />
      <div className="flex-1 min-w-0">
        <div className={`${indent ? "text-xs" : "text-sm"} font-medium leading-tight truncate`}>{title_th}</div>
        <div className="text-[10px] text-slate-500 leading-tight truncate">{title_en}</div>
      </div>
      <span
        className={`text-[11px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full transition-colors ${
          active
            ? "bg-cyan-200/60 text-cyan-700"
            : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
