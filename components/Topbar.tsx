"use client";

import {
  Search,
  Plus,
  ChevronDown,
  Database,
  Settings2,
  Lock,
  Download,
  Info,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export type SortKey = "recent" | "name" | "status";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  onAddNew: () => void;
  resultCount: number;
  sortBy: SortKey;
  onSortChange: (s: SortKey) => void;
  searchInputRef?: React.RefObject<HTMLInputElement>;
  isLocal?: boolean;
};

const sortLabels: Record<SortKey, { th: string; en: string }> = {
  recent: { th: "ล่าสุด", en: "Recent" },
  name: { th: "ชื่อ", en: "Name" },
  status: { th: "สถานะ", en: "Status" },
};

export function Topbar({
  search,
  onSearchChange,
  onAddNew,
  resultCount,
  sortBy,
  onSortChange,
  searchInputRef,
  isLocal,
}: Props) {
  return (
    <div className="flex items-center bg-white border-b border-slate-200 h-14 px-4 gap-3 shrink-0">
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`w-2.5 h-2.5 rounded-full ${isLocal ? "bg-amber-500" : "bg-emerald-500"}`}
        />
        <Database className="w-4 h-4 text-slate-600" />
        <div className="flex flex-col leading-tight">
          <span className="font-semibold text-slate-900 text-sm">Codriver Portal</span>
          <span className="text-[10px] text-slate-500">ศูนย์รวมโครงการ · Project Hub</span>
        </div>
        {isLocal && (
          <span
            className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 bg-amber-100 text-amber-800 rounded uppercase tracking-wide"
            title="ข้อมูลเก็บเฉพาะ browser นี้ — ตั้ง Supabase env vars เพื่อ sync cloud / Data stored in this browser only — set Supabase env vars to sync"
          >
            Local mode
          </span>
        )}
      </div>

      <div className="h-8 w-px bg-slate-200 mx-1" />

      <Dropdown
        label="Sort"
        valueTh={sortLabels[sortBy].th}
        valueEn={sortLabels[sortBy].en}
        options={[
          { key: "recent", th: "ล่าสุด", en: "Recent (last accessed)" },
          { key: "name", th: "ชื่อ", en: "Name (A-Z)" },
          { key: "status", th: "สถานะ", en: "Status" },
        ]}
        onSelect={(k) => onSortChange(k as SortKey)}
      />

      <FilterChip label="View" valueTh="ตาราง" valueEn="Table" />

      <div className="flex-1" />

      <div className="text-xs text-slate-500 tabular-nums hidden md:block">
        <span className="font-semibold text-slate-700">{resultCount}</span>
        <span className="ml-1">ผลลัพธ์ / results</span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          ref={searchInputRef}
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ค้นหา / Search (press /)..."
          className="w-64 pl-9 pr-3 h-9 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 placeholder:text-slate-400"
          aria-label="ค้นหาโครงการ / Search projects"
        />
      </div>

      <div className="hidden lg:flex items-center gap-1 text-slate-400">
        <IconButton icon={Settings2} title="ตั้งค่า / Settings" />
        <IconButton icon={Lock} title="ล็อก / Lock" />
        <IconButton icon={Download} title="ส่งออก / Export" />
        <IconButton icon={Info} title="ข้อมูล / Info" />
      </div>

      <button
        onClick={onAddNew}
        className="flex items-center gap-1.5 h-9 pl-2.5 pr-3 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded-md transition-colors shrink-0"
      >
        <Plus className="w-4 h-4" />
        <span className="flex flex-col leading-tight items-start">
          <span className="text-xs">เพิ่มโครงการ</span>
          <span className="text-[10px] opacity-90">New Project</span>
        </span>
      </button>
    </div>
  );
}

function Dropdown({
  label,
  valueTh,
  valueEn,
  options,
  onSelect,
}: {
  label: string;
  valueTh: string;
  valueEn: string;
  options: { key: string; th: string; en: string }[];
  onSelect: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex flex-col items-start gap-0.5 py-1 px-2 rounded hover:bg-slate-50 shrink-0 transition-colors"
      >
        <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-wide font-medium">
          {label}
          <ChevronDown className="w-3 h-3" />
        </div>
        <div className="flex flex-col items-start leading-tight">
          <span className="text-xs font-semibold text-slate-900">{valueTh}</span>
          <span className="text-[10px] text-slate-500">{valueEn}</span>
        </div>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-50 min-w-[180px] overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.key}
              onClick={() => {
                onSelect(opt.key);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 border-b border-slate-100 last:border-0"
            >
              <div className="font-medium text-slate-900">{opt.th}</div>
              <div className="text-[10px] text-slate-500">{opt.en}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, valueTh, valueEn }: { label: string; valueTh: string; valueEn: string }) {
  return (
    <div className="flex flex-col items-start gap-0.5 py-1 px-2 shrink-0">
      <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-wide font-medium">
        {label}
      </div>
      <div className="flex flex-col items-start leading-tight">
        <span className="text-xs font-semibold text-slate-900">{valueTh}</span>
        <span className="text-[10px] text-slate-500">{valueEn}</span>
      </div>
    </div>
  );
}

function IconButton({ icon: Icon, title }: { icon: typeof Search; title: string }) {
  return (
    <button
      className="w-8 h-8 rounded flex items-center justify-center hover:bg-slate-100 hover:text-slate-700 transition-colors"
      title={title}
      aria-label={title}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}
