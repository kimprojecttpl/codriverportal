"use client";

import { Search, Plus, ChevronDown, Database, Settings2, Lock, Download, Info } from "lucide-react";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  onAddNew: () => void;
  resultCount: number;
};

export function Topbar({ search, onSearchChange, onAddNew, resultCount }: Props) {
  return (
    <div className="flex items-center bg-white border-b border-slate-200 h-14 px-4 gap-3 shrink-0">
      <div className="flex items-center gap-2 shrink-0">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
        <Database className="w-4 h-4 text-slate-600" />
        <div className="flex flex-col leading-tight">
          <span className="font-semibold text-slate-900 text-sm">Codriver Portal</span>
          <span className="text-[10px] text-slate-500">ศูนย์รวมโครงการ · Project Hub</span>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </div>

      <div className="h-8 w-px bg-slate-200 mx-1" />

      <FilterChip label="View" valueTh="ทั้งหมด" valueEn="All Projects" />
      <FilterChip label="Status" valueTh="ทุกสถานะ" valueEn="Any Status" />
      <FilterChip label="Category" valueTh="ทุกหมวด" valueEn="All Categories" />
      <FilterChip label="Sort" valueTh="ล่าสุด" valueEn="Recent" />

      <div className="flex-1" />

      <div className="text-xs text-slate-500 tabular-nums hidden md:block">
        <span className="font-semibold text-slate-700">{resultCount}</span>
        <span className="ml-1">ผลลัพธ์ / results</span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ค้นหา / Search..."
          className="w-56 pl-9 pr-3 h-9 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 placeholder:text-slate-400"
          aria-label="ค้นหาโครงการ / Search projects"
        />
      </div>

      <div className="hidden md:flex items-center gap-1 text-slate-400">
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

function FilterChip({ label, valueTh, valueEn }: { label: string; valueTh: string; valueEn: string }) {
  return (
    <button className="flex flex-col items-start gap-0.5 py-1 px-2 rounded hover:bg-slate-50 shrink-0 transition-colors">
      <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-wide font-medium">
        {label}
        <ChevronDown className="w-3 h-3" />
      </div>
      <div className="flex flex-col items-start leading-tight">
        <span className="text-xs font-semibold text-slate-900">{valueTh}</span>
        <span className="text-[10px] text-slate-500">{valueEn}</span>
      </div>
    </button>
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
