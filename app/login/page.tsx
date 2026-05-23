"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In Local mode (no Supabase env), auth is not required — skip login
  useEffect(() => {
    if (createClient() === null) {
      router.replace("/");
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    if (!supabase) {
      router.replace("/");
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        return;
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh-login px-4 relative overflow-hidden">
      {/* Liquid floating blobs — pure decoration */}
      <span
        aria-hidden
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-300/20 blur-3xl animate-pulse-soft pointer-events-none"
      />
      <span
        aria-hidden
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-sky-300/20 blur-3xl animate-pulse-soft pointer-events-none"
        style={{ animationDelay: "1.2s" }}
      />

      <div className="w-full max-w-md relative animate-fade-in">
        <div className="flex items-center justify-center mb-6 gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-bold text-lg ring-2 ring-white/60 shadow-glow-cyan animate-pulse-soft">
            C
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-900">Codriver Portal</div>
            <div className="text-xs text-slate-500">ศูนย์รวมโครงการ · Project Hub</div>
          </div>
        </div>

        <div className="surface-glass backdrop-blur-2xl rounded-2xl shadow-glass-lg p-7">
          <h1 className="text-xl font-semibold text-slate-900 mb-1">เข้าสู่ระบบ</h1>
          <p className="text-xs text-slate-500 mb-6">Sign in to your portal</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                อีเมล <span className="text-slate-400 font-normal">/ Email</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full h-11 px-4 text-sm bg-white/70 backdrop-blur-xl border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 focus:bg-white transition-all duration-200 ease-liquid placeholder:text-slate-400"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                รหัสผ่าน <span className="text-slate-400 font-normal">/ Password</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full h-11 px-4 text-sm bg-white/70 backdrop-blur-xl border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 focus:bg-white transition-all duration-200 ease-liquid placeholder:text-slate-400"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="text-xs bg-rose-50/80 backdrop-blur-xl text-rose-700 border border-rose-200/70 rounded-xl px-3 py-2 animate-fade-in"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-b from-cyan-500 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 disabled:from-cyan-300 disabled:to-cyan-400 text-white text-sm font-medium rounded-full shadow-glow-cyan transition-all duration-200 ease-liquid hover:scale-[1.01] active:scale-100 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "กำลังเข้าสู่ระบบ... / Signing in..." : "เข้าสู่ระบบ / Sign In"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-200/60 text-center text-xs text-slate-500">
            ยังไม่มีบัญชี?{" "}
            <Link href="/signup" className="text-cyan-600 hover:text-cyan-700 hover:underline font-medium">
              สมัครใหม่ / Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
