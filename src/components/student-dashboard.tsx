"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Headphones,
  Search,
  Timer,
  Trophy,
  MessageSquare,
  Users,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Calculator,
  Zap
} from "lucide-react";
import type { IELTSPracticeTest } from "@/types/ielts";
import type { DashboardData } from "@/lib/actions/dashboard-actions";

type StudentDashboardProps = {
  tests: IELTSPracticeTest[];
  currentUser: any;
  dashboardData: DashboardData;
};

export function StudentDashboard({ tests, currentUser, dashboardData }: StudentDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "reading" | "listening">("all");

  const isReading = (t: IELTSPracticeTest) => t.skill === "reading";

  // Filter tests based on tab and search
  const filteredTests = tests.filter((test) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "reading" && test.skill === "reading") ||
      (activeTab === "listening" && test.skill === "listening");

    const matchesSearch =
      searchQuery === "" ||
      test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  // Live Leaderboard & Recent Activities from MongoDB
  const leaderboard = dashboardData.leaderboard;
  const activities = dashboardData.recentActivity;

  const attemptMap = new Map(
    dashboardData.attemptCounts.map((c) => [c.testId, c.count])
  );

  // Helper: count total questions across all sections
  const getTotalQuestions = (test: IELTSPracticeTest) =>
    test.sections.reduce(
      (acc, sec) =>
        acc + sec.questionGroups.reduce((a, g) => a + g.questions.length, 0),
      0
    );

  const rankColors = [
    "bg-yellow-400 text-white",
    "bg-slate-400 text-white",
    "bg-amber-600 text-white"
  ];

  return (
    <div className="space-y-6">

      {/* ── 1. Hero Search Banner (Split Layout) ────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-stretch justify-between gap-6 sm:gap-8">
        <div className="flex-1 max-w-2xl flex flex-col justify-between py-2 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-600">
                <Zap size={10} className="fill-blue-600/10" />
                IELTS Mock Test Platform
              </span>
            </div>
            <h1 className="text-2xl font-black sm:text-3xl lg:text-4xl tracking-tight leading-tight text-slate-900">
              Luyện thi IELTS Online{" "}
              <span className="text-blue-600">chất lượng cao</span>
            </h1>
            <p className="text-sm leading-relaxed text-slate-500 font-medium max-w-xl">
              Thư viện đề thi thử Reading & Listening phong phú, tự động chấm điểm, phân tích chi tiết đáp án và theo sát lộ trình học tập của bạn.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full max-w-lg pt-2">
            <Search size={16} className="absolute left-3.5 top-[calc(0.5rem+10px)] text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm đề thi: tên bài, kỹ năng, dạng câu hỏi..."
              className="w-full rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 pl-10 pr-4 py-3 text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition font-medium shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Right side Image (Cambridge Qualifications logo highlighted) */}
        <div className="w-full md:w-2/5 shrink-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-xl border border-blue-100/50 relative overflow-hidden min-h-[160px] shadow-sm select-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.12)_0%,_transparent_75%)]" />
          <img
            src="/images/cambridge.png"
            alt="Cambridge English Qualifications"
            className="w-full h-auto max-w-[240px] object-contain mix-blend-multiply relative z-10 transition-all duration-500 hover:scale-105 filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.03)]"
            loading="eager"
          />
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-3 relative z-10">
            Official Exam Standard
          </span>
        </div>
      </section>


      {/* ── 3. Skill Jump Cards ────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/reading"
          className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-500 hover:shadow-md hover:-translate-y-0.5 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition shrink-0">
              <BookOpen size={22} />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition">
                IELTS Reading
              </h2>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                Luyện đọc học thuật • Gap-fill • True/False
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 rounded-full px-2 py-0.5">
                  {tests.filter(t => t.skill === "reading").length} đề thi
                </span>
              </div>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition shrink-0" />
        </Link>

        <Link
          href="/listening"
          className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-500 hover:shadow-md hover:-translate-y-0.5 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition shrink-0">
              <Headphones size={22} />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800 group-hover:text-emerald-600 transition">
                IELTS Listening
              </h2>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                Nghe audio • Note-completion • Form-filling
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">
                  {tests.filter(t => t.skill === "listening").length} đề thi
                </span>
              </div>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition shrink-0" />
        </Link>
      </div>

      {/* ── 4. Main Grid: Test List + Sidebar ─────────────────────── */}
      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">

        {/* Left: Test Grid */}
        <div className="space-y-4">
          {/* Header + Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <TrendingUp size={15} className="text-blue-600" />
              Đề thi thử mới cập nhật
            </h2>

            {/* Filter Tabs */}
            <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
              {(["all", "reading", "listening"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition cursor-pointer ${
                    activeTab === tab
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab === "all" ? "Tất cả" : tab === "reading" ? "Reading" : "Listening"}
                </button>
              ))}
            </div>
          </div>

          {filteredTests.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white py-20 text-center text-slate-400 text-sm font-semibold">
              Không tìm thấy đề thi nào phù hợp.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTests.map((test) => {
                const reading = isReading(test);
                const TestIcon = reading ? BookOpen : Headphones;
                const attempts = attemptMap.get(test.id) ?? 0;
                const totalQuestions = getTotalQuestions(test);
                const sectionCount = test.sections.length;

                return (
                  <div
                    key={test.id}
                    className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-blue-400 hover:shadow-md overflow-hidden group"
                  >
                    {/* Cover image or colored header */}
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-100 shrink-0 border-b border-slate-100">
                      {test.coverImage ? (
                        <img
                          src={test.coverImage}
                          alt={test.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className={`h-full w-full flex flex-col items-center justify-center gap-1.5 bg-gradient-to-br ${
                          reading
                            ? "from-blue-50 to-indigo-100 text-blue-500"
                            : "from-emerald-50 to-teal-100 text-emerald-500"
                        }`}>
                          <TestIcon size={24} className="stroke-[1.5] opacity-75" />
                          <span className="text-[9px] font-bold tracking-wider uppercase opacity-60">
                            {reading ? "Reading Passages" : "Listening Audio"}
                          </span>
                        </div>
                      )}
                      {/* Skill badge overlay */}
                      <span className={`absolute top-3 left-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider shadow-sm ${
                        reading ? "bg-blue-600 text-white" : "bg-emerald-600 text-white"
                      }`}>
                        {test.skill}
                      </span>
                    </div>

                    <div className="flex flex-col flex-1 p-4 space-y-3">
                      {/* Title */}
                      <h3 className="text-[13px] font-bold text-slate-800 leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-blue-700 transition">
                        {test.title}
                      </h3>

                      {/* Description if present */}
                      {test.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-medium">
                          {test.description}
                        </p>
                      )}

                      {/* Section & Question metadata row */}
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                        <span>{sectionCount} phần thi</span>
                        <span className="text-slate-200">|</span>
                        <span>{totalQuestions} câu hỏi</span>
                      </div>

                      {/* Stats row */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-400">
                        <span className="flex items-center gap-1">
                          <Timer size={11} />
                          {test.durationMinutes} phút
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={11} />
                          {attempts.toLocaleString("vi")} lượt
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare size={11} />
                          0
                        </span>
                      </div>

                      {/* Tags */}
                      {test.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {test.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Spacer */}
                      <div className="flex-1" />

                      {/* CTA button */}
                      <Link
                        href={`/practice/${test.id}`}
                        className={`mt-1 block w-full rounded-lg border py-2.5 text-center text-[12px] font-bold transition cursor-pointer ${
                          reading
                            ? "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                            : "border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                        }`}
                      >
                        Chi tiết
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <aside className="space-y-4">

          {/* Leaderboard */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-3">
              <Trophy size={13} className="text-yellow-500 fill-yellow-400/30" />
              Bảng xếp hạng
            </h3>
            <div className="space-y-2.5">
              {leaderboard.length === 0 ? (
                <div className="py-8 text-center text-xs font-semibold text-slate-400">
                  Chưa có xếp hạng nào.
                </div>
              ) : (
                leaderboard.map((item, idx) => (
                  <div key={item.userId} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {/* Rank badge */}
                      {idx < 3 ? (
                        <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black shrink-0 ${rankColors[idx]}`}>
                          {idx + 1}
                        </span>
                      ) : (
                        <span className="flex h-5 w-5 items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">
                          {idx + 1}
                        </span>
                      )}
                      {/* Avatar */}
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold text-[10px] uppercase shrink-0">
                        {item.avatarInitial}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-slate-700 truncate max-w-[120px]">{item.displayName}</p>
                        <p className="text-[9px] text-slate-400 font-semibold">{item.totalAttempts} bài đã thi</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 whitespace-nowrap shrink-0">
                      Band {item.bestBand}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>


          {/* IELTS Score Calculator Promo */}
          <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shrink-0 shadow-sm shadow-blue-500/30">
                <Calculator size={16} />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-800">Tính điểm IELTS</p>
                <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">Tự quy đổi số câu đúng sang Band score</p>
              </div>
            </div>
            <button
              type="button"
              className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 py-2 text-[11px] font-bold text-white transition cursor-pointer shadow-sm"
            >
              Tính điểm ngay →
            </button>
          </div>

          {/* Word of the Day */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2 relative overflow-hidden">
            <div className="absolute right-3 top-3 text-slate-100 pointer-events-none">
              <Sparkles size={30} className="stroke-[1]" />
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Từ vựng hàng ngày</p>
            <div>
              <h3 className="text-sm font-black text-blue-600">Ubiquitous</h3>
              <p className="text-[9px] font-semibold text-slate-400 italic">/juːˈbɪk.wɪ.təs/ (adj)</p>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600 font-medium">
              Có mặt ở khắp nơi, phổ biến rộng rãi.
            </p>
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-[10px] font-medium leading-relaxed text-slate-400 italic">
              &ldquo;Smartphones have become ubiquitous in modern society.&rdquo;
            </p>
          </div>



        </aside>
      </div>
    </div>
  );
}
