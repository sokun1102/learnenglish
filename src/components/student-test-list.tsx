"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Headphones,
  Search,
  Timer,
  ArrowRight,
  GraduationCap,
  Trophy,
  Activity
} from "lucide-react";
import type { IELTSPracticeTest } from "@/types/ielts";

type StudentTestListProps = {
  initialTests: IELTSPracticeTest[];
  skill: "reading" | "listening";
};

export function StudentTestList({ initialTests, skill }: StudentTestListProps) {
  const [tests] = useState<IELTSPracticeTest[]>(initialTests);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");

  const filteredTests = tests.filter((test) => {
    const matchesSearch =
      test.title.toLowerCase().includes(search.toLowerCase()) ||
      test.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesLevel = filterLevel === "all" || test.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const isReading = skill === "reading";
  const SkillIcon = isReading ? BookOpen : Headphones;
  const skillTitle = isReading ? "Reading Practice" : "Listening Practice";
  const skillDesc = isReading
    ? "Rèn luyện kỹ năng đọc hiểu, quét thông tin (skimming/scanning) và hoàn thành các bài đọc học thuật."
    : "Luyện kỹ năng nghe hiểu, nắm bắt từ khóa và làm quen với đa dạng accent tiếng Anh trong các phần thi.";

  // Calculate stats
  const totalDuration = tests.reduce((acc, t) => acc + t.durationMinutes, 0);

  return (
    <div className="space-y-6">
      {/* 1. Header Hero section */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                isReading ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
              }`}>
                <SkillIcon size={14} />
                IELTS {skillTitle}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Thư viện đề thi thử {isReading ? "Reading" : "Listening"}
            </h1>
            <p className="text-xs leading-relaxed text-slate-500 font-medium">
              {skillDesc}
            </p>
          </div>

          {/* Quick Stats widget */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 min-w-[240px]">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Tổng số đề</p>
              <p className="text-xl font-black text-slate-800 mt-1">{tests.length} đề</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Thời lượng luyện</p>
              <p className="text-xl font-black text-slate-800 mt-1">{totalDuration} phút</p>
            </div>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/4 opacity-10 pointer-events-none hidden md:block">
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent" />
        </div>
      </div>

      {/* 2. Live Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tiêu đề đề thi hoặc từ khóa tags..."
            className="focus-ring w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-800"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            className="focus-ring rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 font-bold"
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
          >
            <option value="all">Tất cả trình độ (Levels)</option>
            <option value="band_4_5">IELTS Band 4.5</option>
            <option value="band_5_6">IELTS Band 5.5 - 6.0</option>
            <option value="band_6_7">IELTS Band 6.5 - 7.0</option>
            <option value="band_7_8">IELTS Band 7.5 - 8.0</option>
          </select>
        </div>
      </div>

      {/* 3. Tests List Grid */}
      {filteredTests.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center text-slate-400 text-xs font-semibold">
          Không tìm thấy đề thi thử nào phù hợp với bộ lọc tìm kiếm.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredTests.map((test) => {
            // Get band score badge color
            let levelBadge = "bg-blue-50 text-blue-600 border-blue-100";
            if (test.level === "band_7_8") levelBadge = "bg-indigo-50 text-indigo-600 border-indigo-100";
            else if (test.level === "band_6_7") levelBadge = "bg-purple-50 text-purple-600 border-purple-100";

            return (
              <div
                key={test.id}
                className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-500 hover:shadow-md flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${levelBadge}`}>
                      <GraduationCap size={10} />
                      {test.level.replace("_", " ")}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                      <Timer size={11} />
                      {test.durationMinutes} phút
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-black text-slate-800 group-hover:text-blue-600 transition line-clamp-2">
                      {test.title}
                    </h3>
                  </div>

                  {/* Tags list */}
                  <div className="flex flex-wrap gap-1.5">
                    {test.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono select-all truncate max-w-[120px]" title="Mã đề">
                    {test.id}
                  </span>
                  <Link
                    href={`/practice/${test.id}`}
                    className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-[10px] font-bold text-white transition hover:bg-blue-700 shadow-sm"
                  >
                    Bắt đầu thi
                    <ArrowRight size={10} className="group-hover:translate-x-0.5 transition" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
