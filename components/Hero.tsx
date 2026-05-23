"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  ChevronUp,
  ChevronDown,
  Pin,
  Zap,
  LayoutGrid,
  Clock,
  Sparkles,
} from "lucide-react";
import type { ProjectWithTags } from "@/lib/types";

type Props = {
  projects: ProjectWithTags[];
  onAddNew: () => void;
  onSearchFocus: () => void;
  onLaunch: (p: ProjectWithTags) => void;
};

const STORAGE_KEY = "codriver:hero-collapsed";

function formatDateTH(d: Date) {
  return d.toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateEN(d: Date) {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function greetingTH(h: number) {
  if (h < 5) return "สวัสดียามดึก";
  if (h < 12) return "อรุณสวัสดิ์";
  if (h < 17) return "สวัสดีตอนบ่าย";
  if (h < 20) return "สวัสดีตอนเย็น";
  return "สวัสดีตอนค่ำ";
}

function greetingEN(h: number) {
  if (h < 5) return "Late night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 20) return "Good evening";
  return "Good night";
}

function formatLastAccess(iso: string | null): { th: string; en: string } {
  if (!iso) return { th: "ยังไม่มี", en: "None yet" };
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return { th: "เมื่อสักครู่", en: "Just now" };
  if (mins < 60) return { th: `${mins} นาทีที่แล้ว`, en: `${mins}m ago` };
  if (hours < 24) return { th: `${hours} ชม.ที่แล้ว`, en: `${hours}h ago` };
  if (days < 7) return { th: `${days} วันที่แล้ว`, en: `${days}d ago` };
  return {
    th: d.toLocaleDateString("th-TH", { day: "numeric", month: "short" }),
    en: d.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
  };
}

export function Hero({ projects, onAddNew, onSearchFocus, onLaunch }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  // Hydrate from localStorage + current date (client-only to avoid SSR mismatch)
  useEffect(() => {
    setNow(new Date());
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "1") setCollapsed(true);
  }, []);

  // Live clock-ish — refresh date every minute (so greeting/relative time stay current)
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // localStorage unavailable — non-blocking
      }
      return next;
    });
  }

  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter((p) => p.status === "active").length;
    const pinned = projects.filter((p) => p.pinned).length;
    const lastIso = projects
      .map((p) => p.last_accessed_at)
      .filter((x): x is string => !!x)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null;
    return { total, active, pinned, last: formatLastAccess(lastIso) };
  }, [projects]);

  const pinnedProjects = useMemo(
    () => projects.filter((p) => p.pinned).slice(0, 6),
    [projects]
  );

  const hour = now?.getHours() ?? 12;
  const dateTH = now ? formatDateTH(now) : "";
  const dateEN = now ? formatDateEN(now) : "";

  return (
    <section
      className="bg-mesh-cyan border-b border-slate-200/70 shrink-0 transition-all duration-500 ease-liquid"
      aria-label="ภาพรวม / Overview"
    >
      <div className="px-6 py-4">
        {/* Header row — greeting + date + toggle */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-500" aria-hidden />
              <h1 className="text-lg md:text-xl font-semibold text-slate-900 leading-tight">
                {greetingTH(hour)} Kim
              </h1>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 leading-tight">
              {greetingEN(hour)} · <span className="tabular-nums">{dateEN || "—"}</span>
            </div>
            {!collapsed && (
              <div className="text-[11px] text-slate-400 mt-0.5 tabular-nums">
                {dateTH}
              </div>
            )}
          </div>

          <button
            onClick={toggle}
            className="shrink-0 flex items-center gap-1 text-[11px] text-slate-500 hover:text-cyan-600 px-2 py-1 rounded-md hover:bg-white/60 transition-colors"
            aria-label={collapsed ? "ขยายภาพรวม / Expand overview" : "ย่อภาพรวม / Collapse overview"}
            title={collapsed ? "ขยาย / Expand" : "ย่อ / Collapse"}
          >
            {collapsed ? (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>ขยาย / Expand</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>ย่อ / Collapse</span>
              </>
            )}
          </button>
        </div>

        {/* Expanded content */}
        {!collapsed && (
          <div className="mt-4 grid gap-4 animate-fade-in">
            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                icon={LayoutGrid}
                value={stats.total}
                labelTh="ทั้งหมด"
                labelEn="Total projects"
                tone="cyan"
              />
              <StatCard
                icon={Zap}
                value={stats.active}
                labelTh="กำลังทำ"
                labelEn="Active"
                tone="emerald"
              />
              <StatCard
                icon={Pin}
                value={stats.pinned}
                labelTh="ปักหมุด"
                labelEn="Pinned"
                tone="amber"
              />
              <StatCard
                icon={Clock}
                textValue={stats.last.th}
                subValue={stats.last.en}
                labelTh="เข้าใช้ล่าสุด"
                labelEn="Last accessed"
                tone="slate"
              />
            </div>

            {/* Quick actions row */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onAddNew}
                className="flex items-center gap-2 h-9 pl-3 pr-4 rounded-full bg-gradient-to-b from-cyan-500 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 text-white text-sm font-medium shadow-glow-cyan transition-all duration-200 ease-liquid hover:scale-[1.02] active:scale-100"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">เพิ่มโครงการ</span>
                <span className="sm:hidden">เพิ่ม</span>
                <span className="text-[11px] opacity-90 hidden sm:inline">/ New</span>
              </button>

              <button
                onClick={onSearchFocus}
                className="flex items-center gap-2 h-9 pl-3 pr-3 rounded-full surface-glass backdrop-blur-xl text-slate-700 hover:text-slate-900 text-sm hover:bg-white/80 transition-all duration-200 ease-liquid"
                title="ค้นหา / Search (press /)"
              >
                <Search className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">ค้นหา</span>
                <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 font-mono">
                  /
                </kbd>
              </button>

              {/* Pinned shortcuts */}
              {pinnedProjects.length > 0 && (
                <>
                  <div className="h-6 w-px bg-slate-300/60 mx-1 hidden md:block" />
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mr-1">
                    <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="hidden md:inline">ปักหมุด / Pinned</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {pinnedProjects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => onLaunch(p)}
                        className="group flex items-center gap-1.5 h-8 px-2.5 rounded-full surface-glass backdrop-blur-xl text-slate-700 hover:text-cyan-700 text-xs hover:bg-white/90 hover:shadow-glass transition-all duration-200 ease-liquid hover:-translate-y-0.5"
                        title={`${p.name_th} / ${p.name_en} — เปิด / Launch`}
                      >
                        <span aria-hidden className="text-sm leading-none">
                          {p.icon ?? "📁"}
                        </span>
                        <span className="font-medium max-w-[140px] truncate">
                          {p.name_th}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

type Tone = "cyan" | "emerald" | "amber" | "slate";

const toneStyles: Record<Tone, { ring: string; icon: string; valueText: string }> = {
  cyan: {
    ring: "shadow-glass hover:shadow-glow-cyan",
    icon: "text-cyan-600 bg-cyan-50/80",
    valueText: "text-cyan-700",
  },
  emerald: {
    ring: "shadow-glass hover:shadow-glow-emerald",
    icon: "text-emerald-600 bg-emerald-50/80",
    valueText: "text-emerald-700",
  },
  amber: {
    ring: "shadow-glass",
    icon: "text-amber-600 bg-amber-50/80",
    valueText: "text-amber-700",
  },
  slate: {
    ring: "shadow-glass",
    icon: "text-slate-600 bg-slate-100/80",
    valueText: "text-slate-700",
  },
};

function StatCard({
  icon: Icon,
  value,
  textValue,
  subValue,
  labelTh,
  labelEn,
  tone,
}: {
  icon: typeof LayoutGrid;
  value?: number;
  textValue?: string;
  subValue?: string;
  labelTh: string;
  labelEn: string;
  tone: Tone;
}) {
  const s = toneStyles[tone];
  return (
    <div
      className={`surface-glass backdrop-blur-xl rounded-2xl p-3 transition-all duration-300 ease-liquid hover:-translate-y-0.5 ${s.ring}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${s.icon}`}>
          <Icon className="w-4 h-4" />
        </div>
        {typeof value === "number" && (
          <div className={`text-2xl font-semibold tabular-nums leading-none ${s.valueText}`}>
            {value}
          </div>
        )}
      </div>
      {textValue && (
        <div className={`text-sm font-semibold mt-2 leading-tight truncate ${s.valueText}`}>
          {textValue}
        </div>
      )}
      <div className="mt-2 leading-tight">
        <div className="text-xs font-medium text-slate-700 truncate">{labelTh}</div>
        <div className="text-[10px] text-slate-500 truncate">{subValue ?? labelEn}</div>
      </div>
    </div>
  );
}
