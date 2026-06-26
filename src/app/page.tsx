import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Headphones,
  Timer,
  Plus,
  Download,
  CheckCircle2,
  Calendar,
  Sparkles,
  TrendingUp,
  Cpu,
  UserCheck,
  Settings
} from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { getTests } from "@/lib/actions/test-actions";
import { getCurrentUser } from "@/lib/actions/auth-actions";
import { getAdminOverviewStats } from "@/lib/actions/admin-actions";
import { getDashboardData } from "@/lib/actions/dashboard-actions";
import { StudentDashboard } from "@/components/student-dashboard";

type SearchParams = Promise<{ skill?: string }>;

export default async function HomePage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const { skill } = await searchParams;
  const currentUser = await getCurrentUser();
  const isAdmin = currentUser?.role === "admin";

  // Load practice tests from database
  let tests = await getTests();
  if (skill) {
    tests = tests.filter((test) => test.skill === skill);
  }

  // 1. ADMIN DASHBOARD VIEW
  if (isAdmin) {
    const adminStats = await getAdminOverviewStats();

    return (
      <SiteShell>
        <div className="space-y-6">
          {/* Header section */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Platform Overview</span>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">Platform Overview</h1>
              <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                Real-time telemetry and student performance metrics.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
                <Download size={14} />
                Export Data
              </button>
              <Link
                href="/admin/tests/new"
                className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/10 cursor-pointer"
              >
                <Plus size={14} />
                New Test
              </Link>
            </div>
          </div>

          {/* Statistics grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Stats Card 1 */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Active Students</p>
                <div className="rounded-md bg-blue-50 p-1.5 text-blue-600 group-hover:scale-110 transition">
                  <UserCheck size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {adminStats.totalStudents.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 mt-2 text-[10px] font-semibold text-green-600">
                <TrendingUp size={12} />
                <span>+2.4% vs last month</span>
              </div>
            </div>

            {/* Stats Card 2 */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tests Completed (30d)</p>
                <div className="rounded-md bg-green-50 p-1.5 text-green-600 group-hover:scale-110 transition">
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {adminStats.totalAttempts.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 mt-2 text-[10px] font-semibold text-green-600">
                <TrendingUp size={12} />
                <span>+12.1% vs last month</span>
              </div>
            </div>

            {/* Stats Card 3 */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Average Band Score</p>
                <div className="rounded-md bg-purple-50 p-1.5 text-purple-600 group-hover:scale-110 transition">
                  <Sparkles size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {adminStats.averageBand}
              </p>
              <div className="flex items-center gap-1 mt-2 text-[10px] font-semibold text-slate-400">
                <span>~ 0.5% stable</span>
              </div>
            </div>

            {/* Stats Card 4 */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">System Uptime</p>
                <div className="rounded-md bg-amber-50 p-1.5 text-amber-600 group-hover:scale-110 transition">
                  <Cpu size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">99.98%</p>
              <div className="flex items-center gap-1 mt-2 text-[10px] font-semibold text-blue-600">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-ping" />
                <span>All services operational</span>
              </div>
            </div>
          </div>

          {/* Split layout */}
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            {/* Left side: Recent submissions */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Recent Submissions</h2>
                <Link href="/admin/audit-logs" className="text-[10px] font-bold text-blue-600 hover:underline">
                  View All
                </Link>
              </div>

              {adminStats.recentSubmissions.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 font-medium">
                  Chưa có bài thi thử nào được nộp gần đây.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 font-bold text-slate-400">
                        <th className="pb-3 text-[10px] uppercase">Student</th>
                        <th className="pb-3 text-[10px] uppercase">Test Module</th>
                        <th className="pb-3 text-[10px] uppercase text-center">Score</th>
                        <th className="pb-3 text-[10px] uppercase text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {adminStats.recentSubmissions.map((sub) => {
                        const bandScore = parseFloat(sub.percentage >= 90 ? "9.0" : sub.percentage >= 70 ? "7.5" : sub.percentage >= 50 ? "6.0" : "5.5");
                        let scoreColor = "bg-red-50 text-red-600";
                        if (bandScore >= 7.5) scoreColor = "bg-emerald-50 text-emerald-600";
                        else if (bandScore >= 6.0) scoreColor = "bg-blue-50 text-blue-600";

                        return (
                          <tr key={sub.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-3 pr-2">
                              <p className="font-bold text-slate-800">{sub.studentName}</p>
                              <p className="text-[10px] text-slate-400">{sub.studentEmail}</p>
                            </td>
                            <td className="py-3 text-slate-500 font-medium">
                              {sub.testTitle}
                              <span className="ml-2 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 uppercase">
                                {sub.skill}
                              </span>
                            </td>
                            <td className="py-3 text-center">
                              <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full font-bold text-[11px] ${scoreColor}`}>
                                {bandScore.toFixed(1)}
                              </span>
                            </td>
                            <td className="py-3 text-right text-slate-400 font-medium">
                              {new Date(sub.submittedAt).toLocaleDateString("vi-VN", {
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

            {/* Right side: Quick actions & Stats */}
            <div className="space-y-6">
              {/* Engagement breakdown */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                  Content Engagement
                </h2>
                <div className="space-y-3.5">
                  {/* Reading progress */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                      <span>Reading Tests</span>
                      <span>62%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: "62%" }} />
                    </div>
                  </div>
                  {/* Listening progress */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                      <span>Listening Tests</span>
                      <span>33%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: "33%" }} />
                    </div>
                  </div>
                  {/* Writing progress */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                      <span>Writing Tasks</span>
                      <span>20%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: "20%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions grid */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                  Quick Actions
                </h2>
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    href="/admin/tests/new"
                    className="focus-ring flex flex-col items-center justify-center p-3 rounded-lg border border-slate-100 hover:border-blue-600 hover:bg-blue-50/10 text-center transition cursor-pointer"
                  >
                    <BookOpen size={18} className="text-blue-600 mb-1" />
                    <span className="text-[10px] font-bold text-slate-700">Add Passage</span>
                  </Link>
                  <Link
                    href="/admin"
                    className="focus-ring flex flex-col items-center justify-center p-3 rounded-lg border border-slate-100 hover:border-blue-600 hover:bg-blue-50/10 text-center transition cursor-pointer"
                  >
                    <UserCheck size={18} className="text-green-600 mb-1" />
                    <span className="text-[10px] font-bold text-slate-700">Manage Users</span>
                  </Link>
                  <Link
                    href="/admin/settings"
                    className="focus-ring flex flex-col items-center justify-center p-3 rounded-lg border border-slate-100 hover:border-blue-600 hover:bg-blue-50/10 text-center transition cursor-pointer"
                  >
                    <Settings size={18} className="text-amber-500 mb-1" />
                    <span className="text-[10px] font-bold text-slate-700">System Config</span>
                  </Link>
                  <Link
                    href="/admin/audit-logs"
                    className="focus-ring flex flex-col items-center justify-center p-3 rounded-lg border border-slate-100 hover:border-blue-600 hover:bg-blue-50/10 text-center transition cursor-pointer"
                  >
                    <Cpu size={18} className="text-purple-600 mb-1" />
                    <span className="text-[10px] font-bold text-slate-700">Activity Logs</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SiteShell>
    );
  }

  // 2. STUDENT/GUEST DASHBOARD VIEW
  const dashboardData = await getDashboardData();
  return (
    <SiteShell>
      <StudentDashboard
        tests={tests}
        currentUser={currentUser}
        dashboardData={dashboardData}
      />
    </SiteShell>
  );
}
