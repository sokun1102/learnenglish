"use client";

import { useState } from "react";
import {
  User,
  LogIn,
  LogOut,
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  FileText,
  UserPlus,
  Compass,
  Mail,
  Shield,
  Clock,
  Sparkles
} from "lucide-react";
import { loginUser, registerUser, logoutUser } from "@/lib/actions/auth-actions";
import { updateStudentProfile, getStudentAttemptHistory } from "@/lib/actions/profile-actions";
import type { UserSession } from "@/types/user";

type AttemptRecord = {
  attemptId: string;
  testId: string;
  testTitle: string;
  skill: string;
  correct: number;
  total: number;
  percentage: number;
  submittedAt: string;
};

export function StudentProfile({
  initialUser,
  initialAttempts
}: {
  initialUser: UserSession | null;
  initialAttempts: AttemptRecord[];
}) {
  const [user, setUser] = useState<UserSession | null>(initialUser);
  const [attempts, setAttempts] = useState<AttemptRecord[]>(initialAttempts);

  // Auth Panel States
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Profile Edit States
  const [editName, setEditName] = useState(user?.displayName || "");
  const [editTarget, setEditTarget] = useState(user?.targetBand || 6.5);
  const [isUpdating, setIsUpdating] = useState(false);

  // Preferences toggles (mock client state)
  const [strictTiming, setStrictTiming] = useState(true);
  const [highContrast, setHighContrast] = useState(false);

  // Handle Login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setAuthError("");
    try {
      const res = await loginUser(email, password);
      if (res.success && res.user) {
        setUser(res.user);
        setEditName(res.user.displayName);
        setEditTarget(res.user.targetBand || 6.5);
        const history = await getStudentAttemptHistory();
        setAttempts(history);
      } else {
        setAuthError(res.error || "Đăng nhập thất bại.");
      }
    } catch (err: any) {
      setAuthError(err.message || "Đã xảy ra lỗi.");
    } finally {
      setIsLoading(false);
    }
  }

  // Handle Register
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!regName.trim()) {
      setAuthError("Vui lòng nhập tên hiển thị.");
      return;
    }
    setIsLoading(true);
    setAuthError("");
    try {
      const res = await registerUser(email, password, regName);
      if (res.success && res.user) {
        setUser(res.user);
        setEditName(res.user.displayName);
        setEditTarget(res.user.targetBand || 6.5);
        setAttempts([]);
      } else {
        setAuthError(res.error || "Đăng ký thất bại.");
      }
    } catch (err: any) {
      setAuthError(err.message || "Đã xảy ra lỗi.");
    } finally {
      setIsLoading(false);
    }
  }

  // Handle Logout
  async function handleLogout() {
    await logoutUser();
    setUser(null);
    setAttempts([]);
    setEmail("");
    setPassword("");
    setRegName("");
  }

  // Handle Profile Update
  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await updateStudentProfile({
        displayName: editName,
        targetBand: editTarget
      });
      if (res.success && res.user) {
        setUser(res.user);
        alert("Cập nhật thông tin hồ sơ thành công!");
      } else {
        alert(res.error || "Không thể cập nhật thông tin.");
      }
    } catch (err: any) {
      alert("Đã xảy ra lỗi: " + err.message);
    } finally {
      setIsUpdating(false);
    }
  }

  // Calculate Average Band Score for progress view
  const currentEstBand = attempts.length > 0
    ? parseFloat(
        getEstimatedBandScore(
          attempts.reduce((acc, curr) => acc + curr.correct, 0),
          attempts.reduce((acc, curr) => acc + curr.total, 0)
        )
      )
    : 6.0;

  function getEstimatedBandScore(correct: number, total: number): string {
    if (total === 0) return "0.0";
    const pct = (correct / total) * 100;
    if (pct >= 90) return "9.0";
    if (pct >= 85) return "8.5";
    if (pct >= 78) return "8.0";
    if (pct >= 70) return "7.5";
    if (pct >= 62) return "7.0";
    if (pct >= 53) return "6.5";
    if (pct >= 45) return "6.0";
    if (pct >= 35) return "5.5";
    if (pct >= 25) return "5.0";
    if (pct >= 15) return "4.5";
    if (pct >= 5) return "4.0";
    return "3.0";
  }

  // 1. Auth View (Not logged in)
  if (!user) {
    return (
      <div className="mx-auto max-w-md w-full my-12">
        <div className="paper-panel rounded-xl p-6 shadow-md border border-slate-200">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {isLogin ? "Đăng nhập tài khoản" : "Tạo tài khoản học viên"}
            </h1>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
              {isLogin
                ? "Đăng nhập để lưu tiến độ và xem phân tích bài làm IELTS."
                : "Chỉ mất 30 giây để bắt đầu lưu vết kết quả luyện thi thử."}
            </p>
          </div>

          {authError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs font-bold text-red-600 border border-red-100">
              {authError}
            </div>
          )}

          <form onSubmit={isLogin ? handleLogin : handleRegister} className="grid gap-4">
            {!isLogin && (
              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Tên hiển thị</span>
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  className="focus-ring rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                />
              </label>
            )}

            <label className="grid gap-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Email</span>
              <input
                type="email"
                required
                placeholder="hocsinh@example.com"
                className="focus-ring rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="grid gap-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Mật khẩu</span>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="focus-ring rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="focus-ring mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer shadow-md shadow-blue-500/10"
            >
              {isLogin ? <LogIn size={14} /> : <UserPlus size={14} />}
              {isLoading ? "Đang xử lý..." : isLogin ? "Đăng nhập" : "Đăng ký tài khoản"}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setAuthError("");
              }}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              type="button"
            >
              {isLogin ? "Chưa có tài khoản? Đăng ký ngay" : "Đã có tài khoản? Đăng nhập"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Profile & Dashboard View (Logged in)
  return (
    <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
      {/* LEFT COLUMN: Profile Panel (Matches Screenshot 2 side card) */}
      <aside className="grid gap-5 h-fit lg:sticky lg:top-6">
        <div className="paper-panel rounded-xl p-5 shadow-sm border border-slate-200 relative overflow-hidden bg-white">
          <div className="flex flex-col items-center text-center pb-5 border-b border-slate-100">
            {/* Avatar */}
            <div className="relative group">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-extrabold text-xl shadow-inner uppercase">
                {user.displayName.charAt(0)}
              </div>
              <span className="absolute bottom-0 right-0 h-4.5 w-4.5 rounded-full border-2 border-white bg-green-500" />
            </div>

            <h2 className="font-black text-slate-900 text-base mt-3 leading-tight">{user.displayName}</h2>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">{user.email}</p>

            <div className="flex items-center gap-1.5 mt-2.5">
              <span className="rounded bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-600 uppercase">
                Target Band: {editTarget.toFixed(1)}
              </span>
              <span className="rounded bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-600 uppercase">
                Current Est: {currentEstBand.toFixed(1)}
              </span>
            </div>

            <div className="flex items-center gap-1 mt-3">
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500 uppercase">
                Exam in 4 weeks
              </span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500 uppercase">
                Academic Module
              </span>
            </div>
          </div>

          {/* Profile Edit Form */}
          <form onSubmit={handleUpdateProfile} className="grid gap-3.5 pt-5">
            <label className="grid gap-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Tên hiển thị</span>
              <input
                type="text"
                required
                className="focus-ring rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </label>

            <label className="grid gap-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Mục tiêu Band IELTS</span>
              <select
                className="focus-ring rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800"
                value={editTarget}
                onChange={(e) => setEditTarget(parseFloat(e.target.value))}
              >
                {[5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map((band) => (
                  <option key={band} value={band}>
                    IELTS {band.toFixed(1)}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              disabled={isUpdating}
              className="focus-ring inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              Edit Profile
            </button>
          </form>
        </div>

        {/* Account metadata card */}
        <div className="paper-panel rounded-xl p-5 shadow-sm border border-slate-200 bg-white space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">Tài khoản</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span>Vai trò:</span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-700 capitalize">
                {user.role}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Trạng thái:</span>
              <span className="rounded bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-600">
                Premium Active
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            {user.role === "admin" && (
              <a
                href="/admin"
                className="focus-ring inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:border-blue-600 hover:text-blue-600 transition"
              >
                Vào Admin Portal
              </a>
            )}
            <button
              onClick={handleLogout}
              className="focus-ring inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-transparent px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 cursor-pointer"
              type="button"
            >
              <LogOut size={14} />
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* RIGHT COLUMN: Spline chart, Preferences & attempts history */}
      <section className="space-y-6">
        {/* Learning progress SPLINE chart using pure SVG path bezier rendering */}
        <div className="paper-panel rounded-xl p-5 shadow-sm border border-slate-200 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Learning Progress</h2>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">IELTS Mock Test Score History Tracker</p>
            </div>
            <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
              <button type="button" className="px-2.5 py-1 rounded-md text-[9px] font-bold bg-white text-slate-800 shadow-sm">Reading</button>
              <button type="button" className="px-2.5 py-1 rounded-md text-[9px] font-bold text-slate-500 hover:text-slate-800">Listening</button>
            </div>
          </div>

          {/* Custom SVG Bezier chart */}
          <div className="pt-2">
            <svg viewBox="0 0 500 200" className="w-full h-48">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Horizontal grid lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#f8fafc" strokeWidth="1.5" />
              <line x1="40" y1="60" x2="480" y2="60" stroke="#f8fafc" strokeWidth="1.5" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="#f8fafc" strokeWidth="1.5" />
              <line x1="40" y1="140" x2="480" y2="140" stroke="#f8fafc" strokeWidth="1.5" />
              <line x1="40" y1="180" x2="480" y2="180" stroke="#cbd5e1" strokeWidth="1.5" />

              {/* Y Axis band score markers */}
              <text x="18" y="24" className="text-[9px] fill-slate-400 font-bold">9.0</text>
              <text x="18" y="64" className="text-[9px] fill-slate-400 font-bold">7.5</text>
              <text x="18" y="104" className="text-[9px] fill-slate-400 font-bold">6.0</text>
              <text x="18" y="144" className="text-[9px] fill-slate-400 font-bold">4.5</text>

              {/* Area filled curve */}
              <path
                d="M 60,130 C 130,130 150,110 200,90 C 250,70 290,75 340,60 C 390,45 420,50 460,50 L 460,180 L 60,180 Z"
                fill="url(#chartGrad)"
              />

              {/* Stroke spline line */}
              <path
                d="M 60,130 C 130,130 150,110 200,90 C 250,70 290,75 340,60 C 390,45 420,50 460,50"
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Circular markers at vertices */}
              <circle cx="60" cy="130" r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="140" cy="120" r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="200" cy="90" r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="340" cy="60" r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="460" cy="50" r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />

              {/* X Axis labels */}
              <text x="60" y="195" textAnchor="middle" className="text-[9px] fill-slate-400 font-semibold">Test 1</text>
              <text x="140" y="195" textAnchor="middle" className="text-[9px] fill-slate-400 font-semibold">Test 2</text>
              <text x="200" y="195" textAnchor="middle" className="text-[9px] fill-slate-400 font-semibold">Test 3</text>
              <text x="340" y="195" textAnchor="middle" className="text-[9px] fill-slate-400 font-semibold">Test 4</text>
              <text x="460" y="195" textAnchor="middle" className="text-[9px] fill-slate-400 font-semibold">Test 5</text>
            </svg>
          </div>
        </div>

        {/* Split layout: Account Information and Study Preferences */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Account info */}
          <div className="paper-panel rounded-xl p-5 shadow-sm border border-slate-200 bg-white space-y-3.5">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5">
              Account Information
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                <p className="font-semibold text-slate-700 mt-0.5">{user.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Timezone</p>
                <p className="font-semibold text-slate-700 mt-0.5">UTC+07:00 (Hanoi)</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subscription Plan</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="font-semibold text-slate-700">Premium Student</p>
                  <span className="rounded bg-green-50 px-1.5 py-0.5 text-[9px] font-bold text-green-600 uppercase">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences toggles */}
          <div className="paper-panel rounded-xl p-5 shadow-sm border border-slate-200 bg-white space-y-3.5">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5">
              Study Preferences
            </h3>
            <div className="space-y-3">
              {/* Timing preference */}
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-700">Strict Timing</span>
                  <p className="text-[10px] text-slate-400">Auto-submit when timer runs out.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStrictTiming(!strictTiming)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                    strictTiming ? "bg-blue-600" : "bg-slate-200"
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ${
                    strictTiming ? "translate-x-4" : "translate-x-0"
                  }`} />
                </button>
              </label>

              {/* Contrast preference */}
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-700">High Contrast Mode</span>
                  <p className="text-[10px] text-slate-400">Increase readability on mock passages.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setHighContrast(!highContrast)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                    highContrast ? "bg-blue-600" : "bg-slate-200"
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ${
                    highContrast ? "translate-x-4" : "translate-x-0"
                  }`} />
                </button>
              </label>
            </div>
          </div>
        </div>

        {/* Practice Attempts table list */}
        <div className="paper-panel rounded-xl p-5 shadow-sm border border-slate-200 bg-white">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <Award size={16} className="text-blue-600" />
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">Recent Practice Tests</h2>
          </div>

          {attempts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center text-slate-400 text-xs">
              <BookOpen size={42} className="mx-auto text-slate-300 mb-2" />
              <p className="font-semibold">Bạn chưa thực hiện bài thi thử nào.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 font-bold text-slate-500 border-b border-slate-200">
                    <th className="px-4 py-3 text-[10px] uppercase">Bài thi</th>
                    <th className="px-4 py-3 text-[10px] uppercase hidden sm:table-cell">Kỹ năng</th>
                    <th className="px-4 py-3 text-[10px] uppercase">Số câu đúng</th>
                    <th className="px-4 py-3 text-[10px] uppercase">IELTS Band</th>
                    <th className="px-4 py-3 text-[10px] uppercase text-right hidden sm:table-cell">Ngày làm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attempts.map((attempt) => {
                    const bandScore = parseFloat(getEstimatedBandScore(attempt.correct, attempt.total));
                    let bandColor = "bg-red-50 text-red-600";
                    if (bandScore >= 7.0) bandColor = "bg-emerald-50 text-emerald-600";
                    else if (bandScore >= 5.5) bandColor = "bg-blue-50 text-blue-600";

                    return (
                      <tr key={attempt.attemptId} className="hover:bg-slate-50/30 transition">
                        <td className="px-4 py-3">
                          <div className="max-w-[140px] sm:max-w-xs">
                            <a
                              href={`/practice/${attempt.testId}`}
                              className="font-bold text-slate-800 hover:text-blue-600 hover:underline truncate block"
                              title={attempt.testTitle}
                            >
                              {attempt.testTitle}
                            </a>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500 uppercase">
                            {attempt.skill}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-600">
                          {attempt.correct} / {attempt.total}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold ${bandColor}`}>
                            Band {bandScore.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-400 font-semibold hidden sm:table-cell">
                          {new Date(attempt.submittedAt).toLocaleDateString("vi-VN", {
                            month: "short",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
