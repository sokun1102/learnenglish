import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Headphones,
  User,
  Settings,
  LayoutDashboard,
  Menu
} from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth-actions";
import { ZaloFloatingWidget } from "@/components/zalo-floating-widget";

type SiteShellProps = {
  children: React.ReactNode;
  isExamMode?: boolean;
};

export async function SiteShell({ children, isExamMode = false }: SiteShellProps) {
  const currentUser = await getCurrentUser();
  const isAdmin = currentUser?.role === "admin";

  // Distraction-free exam mode: full viewport, no chrome
  if (isExamMode) {
    return (
      <div className="flex h-screen w-full flex-col bg-slate-50 font-sans antialiased text-slate-900">
        {children}
      </div>
    );
  }

  const navLinks = [
    { href: "/", label: "Trang chủ", icon: LayoutDashboard },
    { href: "/reading", label: "Reading", icon: BookOpen },
    { href: "/listening", label: "Listening", icon: Headphones },
    { href: "/profile", label: "Tiến độ", icon: User },
    ...(isAdmin ? [{ href: "/admin", label: "Quản lý", icon: Settings }] : [])
  ];

  return (
    <div className="min-h-screen w-full bg-[#f4f6fb] font-sans antialiased text-slate-900 flex flex-col">
      {/* ─── Top Navigation Header ─────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">

          {/* Left: Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0 hover:opacity-85 transition-opacity select-none"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <GraduationCap size={17} className="fill-blue-100/10" />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-black tracking-tight text-slate-900 uppercase leading-none">
                IELTS Prep
              </span>
              <span className="text-sm font-black tracking-tight text-blue-600 uppercase leading-none">
                Master
              </span>
            </div>
          </Link>

          {/* Center: Nav Links (desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-blue-600"
                >
                  <Icon size={14} className="shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: User info */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2.5">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser.displayName}</p>
                  <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider leading-tight">
                    {currentUser.role}
                  </p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm uppercase shadow-sm">
                  {currentUser.displayName.charAt(0)}
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-lg border border-blue-600 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-600 hover:text-white transition"
              >
                Đăng nhập
              </Link>
            )}

            {/* Mobile hamburger - shows only on small screens */}
            <button
              type="button"
              className="flex md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>

        {/* Mobile nav links strip */}
        <div className="flex md:hidden items-center gap-0.5 overflow-x-auto border-t border-slate-100 px-4 pb-1.5 pt-1 no-scrollbar">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 whitespace-nowrap hover:bg-slate-50 hover:text-blue-600 transition"
              >
                <Icon size={12} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* ─── Main Content ──────────────────────────────────────────── */}
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex-1">
        {children}
      </main>

      {/* ─── Footer ────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-12 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
            {/* Brand block */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <GraduationCap size={17} />
                </div>
                <span className="text-sm font-black tracking-tight text-white uppercase">
                  IELTS PREP MASTER
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Hệ thống luyện thi thử IELTS Online chất lượng cao. Cung cấp các đề thi thử Reading và Listening bám sát đề thi thật, tự động chấm điểm và tổng hợp kết quả chuẩn xác.
              </p>
            </div>

            {/* Quick Links block */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Kỹ năng</h3>
              <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                <Link href="/reading" className="hover:text-blue-400 transition-colors">Reading Practice</Link>
                <Link href="/listening" className="hover:text-blue-400 transition-colors">Listening Practice</Link>
                <Link href="/profile" className="hover:text-blue-400 transition-colors">Tiến độ học tập</Link>
                <Link href="/" className="hover:text-blue-400 transition-colors">Trang chủ</Link>
              </div>
            </div>

            {/* Quality Standard block */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Tiêu chuẩn đề thi</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Cấu trúc đề thi thử và hệ thống câu hỏi được chuẩn hóa theo chuẩn đánh giá năng lực ngôn ngữ quốc tế và định dạng bài thi IELTS chính thức.
              </p>
            </div>

            {/* Location Map block */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Địa chỉ cơ sở</h3>
              <div className="rounded-lg overflow-hidden border border-slate-800 shadow-sm bg-slate-950">
                <iframe
                  src="https://maps.google.com/maps?q=10.728954,106.6533733&hl=vi&z=15&output=embed"
                  width="100%"
                  height="120"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  title="IELTS Prep Master Location"
                  className="grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                />
              </div>
              <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                Khu vực Quận 8, TP. Hồ Chí Minh
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-[11px] font-semibold text-slate-500">
            <p>© {new Date().getFullYear()} IELTS Prep Master. All rights reserved.</p>
            <p className="text-right">Hệ thống mô phỏng đề luyện thi Cambridge English Qualifications™</p>
          </div>
        </div>
      </footer>

      {/* ─── Zalo Floating Chat Widget ──────────────────────────── */}
      <ZaloFloatingWidget />
    </div>
  );
}
