"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { loginUser, registerUser } from "@/lib/actions/auth-actions";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (mode === "login") {
        const result = await loginUser(email, password);
        if (!result.success) {
          setError(result.error || "Đăng nhập thất bại.");
          return;
        }
      } else {
        if (!displayName.trim()) {
          setError("Vui lòng nhập tên hiển thị.");
          return;
        }
        if (password.length < 6) {
          setError("Mật khẩu phải có ít nhất 6 ký tự.");
          return;
        }
        const result = await registerUser(email, password, displayName);
        if (!result.success) {
          setError(result.error || "Đăng ký thất bại.");
          return;
        }
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Đã xảy ra lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#f4f6fb] font-sans antialiased flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">

        {/* Logo + Branding */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <GraduationCap size={20} />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 uppercase">IELTS Prep</span>
              <span className="text-lg font-black tracking-tight text-blue-600 uppercase"> Master</span>
            </div>
          </Link>
          <p className="text-xs text-slate-400 font-semibold">
            {mode === "login" ? "Đăng nhập để tiếp tục luyện thi" : "Tạo tài khoản mới để bắt đầu"}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">

          {/* Mode toggle tabs */}
          <div className="flex bg-slate-100 rounded-lg p-0.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-2 rounded-md transition cursor-pointer ${
                mode === "login" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setError(""); }}
              className={`flex-1 py-2 rounded-md transition cursor-pointer ${
                mode === "register" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Đăng ký
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2.5 text-xs text-red-600 font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Display Name (register only) */}
            {mode === "register" && (
              <label className="grid gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tên hiển thị</span>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
              </label>
            )}

            {/* Email */}
            <label className="grid gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email</span>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  placeholder="email@example.com"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </label>

            {/* Password */}
            <label className="grid gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mật khẩu</span>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-10 text-sm text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-sm font-extrabold text-white shadow-md shadow-blue-500/15 transition disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 size={14} className="animate-spin" />}
              {mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
            </button>
          </form>
        </div>

        {/* Bottom link */}
        <p className="text-center text-xs text-slate-400 font-medium">
          <Link href="/" className="text-blue-600 hover:underline font-bold">
            ← Quay về trang chủ
          </Link>
        </p>
      </div>
    </div>
  );
}
