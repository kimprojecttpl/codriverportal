"use client";

import { Home, Settings, LogOut, Info, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { clearLocalData } from "@/lib/local-store";
import { useState, useMemo } from "react";
import { ConfirmDialog } from "./ConfirmDialog";

const navItems = [
  { id: "home", icon: Home, label_th: "หน้าหลัก", label_en: "Home", href: "/" },
  { id: "settings", icon: Settings, label_th: "ตั้งค่า", label_en: "Settings", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const isLocal = useMemo(() => createClient() === null, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      if (supabase) await supabase.auth.signOut();
    } catch {
      // proceed to redirect even if signOut fails
    }
    router.push("/login");
    router.refresh();
  }

  async function handleClearLocal() {
    clearLocalData();
    router.refresh();
  }

  return (
    <aside className="w-16 bg-slate-900 flex flex-col items-center py-3 gap-1 shrink-0 relative">
      {/* Subtle vertical glow on right edge — liquid depth */}
      <span
        aria-hidden
        className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent pointer-events-none"
      />

      <Link
        href="/"
        className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-bold text-sm mb-1 ring-1 ring-cyan-300/30 shadow-glow-cyan hover:scale-105 transition-transform duration-200 ease-liquid"
        title="Codriver Portal"
      >
        C
      </Link>
      <div
        className="w-2 h-2 rounded-full bg-emerald-400 mb-3 animate-pulse-soft shadow-glow-emerald"
        title="Online"
        aria-label="ออนไลน์ / Online"
      />

      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`group relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ease-liquid ${
              isActive
                ? "bg-cyan-500/15 text-cyan-300 shadow-glow-cyan"
                : "text-slate-400 hover:bg-slate-800 hover:text-white hover:scale-105"
            }`}
            title={`${item.label_th} / ${item.label_en}`}
            aria-label={`${item.label_th} / ${item.label_en}`}
          >
            <Icon className="w-5 h-5" />
            {isActive && (
              <span
                aria-hidden
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_12px_rgba(34,211,238,0.8)]"
              />
            )}
          </Link>
        );
      })}

      <div className="flex-1" />

      <button
        className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white hover:scale-105 transition-all duration-200 ease-liquid"
        title="ข้อมูล / Info"
        aria-label="Info"
      >
        <Info className="w-5 h-5" />
      </button>

      {isLocal ? (
        <button
          onClick={() => setConfirmClear(true)}
          className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-400 hover:bg-rose-500/15 hover:text-rose-400 hover:scale-105 transition-all duration-200 ease-liquid"
          title="ล้างข้อมูล local / Clear local data"
          aria-label="Clear local data"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      ) : (
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-400 hover:bg-rose-500/15 hover:text-rose-400 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-200 ease-liquid"
          title="ออกจากระบบ / Logout"
          aria-label="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      )}

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={handleClearLocal}
        title_th="ล้างข้อมูลในเครื่อง"
        title_en="Clear local data"
        message_th="ลบโครงการและหมวดหมู่ทั้งหมดในเครื่องนี้? ย้อนกลับไม่ได้"
        message_en="Delete all projects and categories on this device? Cannot be undone."
        confirmLabel_th="ล้าง"
        confirmLabel_en="Clear"
        danger
      />
    </aside>
  );
}
