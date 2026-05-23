"use client";

import { useState } from "react";
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-6 gap-3">
          <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-cyan-500/30">
            C
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-900">Codriver Portal</div>
            <div className="text-xs text-slate-500">ศูนย์รวมโครงการ · Project Hub</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <h1 className="text-lg font-semibold text-slate-900 mb-1">เข้าสู่ระบบ</h1>
          <p className="text-xs text-slate-500 mb-5">Sign in to your portal</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1">
                อีเมล <span className="text-slate-400 font-normal">/ Email</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1">
                รหัสผ่าน <span className="text-slate-400 font-normal">/ Password</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-md px-3 py-2"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-400 text-white text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "กำลังเข้าสู่ระบบ... / Signing in..." : "เข้าสู่ระบบ / Sign In"}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            ยังไม่มีบัญชี?{" "}
            <Link href="/signup" className="text-cyan-600 hover:underline font-medium">
              สมัครใหม่ / Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
