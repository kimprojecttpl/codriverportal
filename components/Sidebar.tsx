"use client";

import { Home, LayoutGrid, FolderTree, Tags, Settings, Info } from "lucide-react";
import { useState } from "react";

const navItems = [
  { id: "home", icon: Home, label_th: "หน้าหลัก", label_en: "Home" },
  { id: "projects", icon: LayoutGrid, label_th: "โครงการ", label_en: "Projects" },
  { id: "categories", icon: FolderTree, label_th: "หมวดหมู่", label_en: "Categories" },
  { id: "tags", icon: Tags, label_th: "แท็ก", label_en: "Tags" },
  { id: "settings", icon: Settings, label_th: "ตั้งค่า", label_en: "Settings" },
];

export function Sidebar() {
  const [active, setActive] = useState("projects");

  return (
    <aside className="w-16 bg-slate-900 flex flex-col items-center py-3 gap-1 shrink-0">
      <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold text-sm mb-1 shadow-lg shadow-cyan-500/30">
        C
      </div>
      <div className="w-2 h-2 rounded-full bg-emerald-400 mb-3" title="Online" />

      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`group relative w-12 h-12 rounded-md flex items-center justify-center transition-colors ${
              isActive
                ? "bg-cyan-500/15 text-cyan-400"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
            title={`${item.label_th} / ${item.label_en}`}
            aria-label={`${item.label_th} / ${item.label_en}`}
          >
            <Icon className="w-5 h-5" />
            {isActive && (
              <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-cyan-400 rounded-r" />
            )}
          </button>
        );
      })}

      <div className="flex-1" />

      <button
        className="w-12 h-12 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white"
        title="ข้อมูล / Info"
        aria-label="Info"
      >
        <Info className="w-5 h-5" />
      </button>

      <div className="w-9 h-9 mt-1 rounded-full bg-slate-700 text-white text-xs font-semibold flex items-center justify-center">
        K
      </div>
    </aside>
  );
}
