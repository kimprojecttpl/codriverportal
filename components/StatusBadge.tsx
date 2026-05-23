import type { ProjectStatus } from "@/lib/types";

const statusStyles: Record<
  ProjectStatus,
  { bg: string; text: string; dot: string; label_th: string; label_en: string }
> = {
  active: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    label_th: "กำลังทำ",
    label_en: "Active",
  },
  paused: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    label_th: "พัก",
    label_en: "Paused",
  },
  done: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    dot: "bg-slate-400",
    label_th: "เสร็จแล้ว",
    label_en: "Done",
  },
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const s = statusStyles[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      <span>
        {s.label_th}
        <span className="opacity-60"> / {s.label_en}</span>
      </span>
    </span>
  );
}
