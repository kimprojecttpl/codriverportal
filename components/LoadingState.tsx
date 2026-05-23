import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-12 bg-white gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      <div className="text-sm text-slate-600">กำลังโหลด...</div>
      <div className="text-xs text-slate-400">Loading projects from database</div>
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  const isMissingEnv =
    error.toLowerCase().includes("supabase") ||
    error.toLowerCase().includes("fetch") ||
    error.toLowerCase().includes("undefined");
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-12 bg-white gap-3 max-w-2xl mx-auto">
      <div className="text-5xl mb-2">⚠️</div>
      <div className="text-base font-semibold text-rose-700">เกิดข้อผิดพลาด / Something went wrong</div>
      <div className="text-xs text-slate-600 text-center font-mono bg-slate-50 px-3 py-2 rounded max-w-md break-words">
        {error}
      </div>
      {isMissingEnv && (
        <div className="text-xs text-slate-500 text-center max-w-md mt-2">
          อาจเป็นเพราะยังไม่ตั้งค่า Supabase — ตรวจ <code className="bg-slate-100 px-1 rounded">.env.local</code>
          <br />
          Possibly missing Supabase config — check <code className="bg-slate-100 px-1 rounded">.env.local</code>
        </div>
      )}
      <button
        onClick={onRetry}
        className="mt-2 h-9 px-4 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded-md"
      >
        ลองอีกครั้ง / Retry
      </button>
    </div>
  );
}
