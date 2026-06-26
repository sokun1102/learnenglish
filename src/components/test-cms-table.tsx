"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  Headphones,
  Edit2,
  Trash2,
  ExternalLink,
  Plus,
  Settings,
  ShieldAlert,
  GraduationCap
} from "lucide-react";
import { deleteTest, toggleTestStatus } from "@/lib/actions/test-actions";
import type { IELTSPracticeTest } from "@/types/ielts";

export function TestCmsTable({ initialTests }: { initialTests: IELTSPracticeTest[] }) {
  const [tests, setTests] = useState<IELTSPracticeTest[]>(initialTests);
  const [search, setSearch] = useState("");
  const [filterSkill, setFilterSkill] = useState<"all" | "reading" | "listening">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "published" | "archived">("all");

  // Handle status toggle
  async function handleStatusChange(id: string, newStatus: "draft" | "published" | "archived") {
    try {
      const success = await toggleTestStatus(id, newStatus);
      if (success) {
        setTests((current) =>
          current.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
        );
      } else {
        alert("Không thể cập nhật trạng thái đề thi.");
      }
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi khi thay đổi trạng thái.");
    }
  }

  // Handle delete test
  async function handleDelete(id: string, title: string) {
    if (!confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn đề thi: "${title}" không?`)) {
      return;
    }

    try {
      const success = await deleteTest(id);
      if (success) {
        setTests((current) => current.filter((t) => t.id !== id));
        alert("Đã xóa đề thi thành công!");
      } else {
        alert("Không thể xóa đề thi.");
      }
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi khi xóa đề thi.");
    }
  }

  // Client-side search and filters
  const filteredTests = tests.filter((test) => {
    const matchesSearch = test.title.toLowerCase().includes(search.toLowerCase()) || test.id.includes(search);
    const matchesSkill = filterSkill === "all" || test.skill === filterSkill;
    const matchesStatus = filterStatus === "all" || test.status === filterStatus;
    return matchesSearch && matchesSkill && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* Search and filter controls bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề hoặc mã đề thi..."
            className="focus-ring w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-800"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Skill filter */}
          <select
            className="focus-ring rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 font-bold"
            value={filterSkill}
            onChange={(e) => setFilterSkill(e.target.value as any)}
          >
            <option value="all">Tất cả kỹ năng</option>
            <option value="reading">Reading</option>
            <option value="listening">Listening</option>
          </select>

          {/* Status filter */}
          <select
            className="focus-ring rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 font-bold"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="draft">Bản nháp (Draft)</option>
            <option value="published">Đã đăng (Published)</option>
            <option value="archived">Đã lưu trữ (Archived)</option>
          </select>
        </div>
      </div>

      {/* Main CMS tests table list */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {filteredTests.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 font-semibold">
            Không tìm thấy đề thi nào khớp với bộ lọc tìm kiếm.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-50 font-bold text-slate-500 border-b border-slate-200">
                  <th className="px-5 py-3 text-[10px] uppercase">Đề thi</th>
                  <th className="px-5 py-3 text-[10px] uppercase hidden sm:table-cell">Kỹ năng</th>
                  <th className="px-5 py-3 text-[10px] uppercase hidden md:table-cell">Độ khó</th>
                  <th className="px-5 py-3 text-[10px] uppercase hidden sm:table-cell">Thời gian</th>
                  <th className="px-5 py-3 text-[10px] uppercase">Trạng thái</th>
                  <th className="px-5 py-3 text-[10px] uppercase text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTests.map((test) => {
                  const SkillIcon = test.skill === "reading" ? BookOpen : Headphones;
                  let statusBadge = "bg-slate-50 text-slate-500 border-slate-200";
                  if (test.status === "published") statusBadge = "bg-green-50 text-green-600 border-green-200";
                  else if (test.status === "archived") statusBadge = "bg-red-50 text-red-600 border-red-200";

                  return (
                    <tr key={test.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-5 py-4">
                        <div className="max-w-[180px] sm:max-w-sm">
                          <p className="font-extrabold text-slate-800 text-xs leading-normal truncate">{test.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5 select-all truncate">{test.id}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500 uppercase">
                          <SkillIcon size={10} />
                          {test.skill}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell font-semibold text-slate-600 capitalize">
                        {test.level.replace("band_", "IELTS ")}
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell font-semibold text-slate-600">
                        {test.durationMinutes} phút
                      </td>
                      <td className="px-5 py-4">
                        <select
                          className={`rounded border px-2 py-0.5 text-[10px] font-bold cursor-pointer transition ${statusBadge}`}
                          value={test.status}
                          onChange={(e) => handleStatusChange(test.id, e.target.value as any)}
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>
                      <td className="px-5 py-4 text-right space-x-1.5">
                        <Link
                          href={`/practice/${test.id}`}
                          className="focus-ring inline-flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-white text-slate-500 hover:text-blue-600 hover:border-blue-600 transition"
                          title="Preview đề thi"
                        >
                          <ExternalLink size={12} />
                        </Link>
                        <Link
                          href={`/admin/tests/new?id=${test.id}`}
                          className="focus-ring inline-flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-white text-slate-500 hover:text-amber-600 hover:border-amber-600 transition"
                          title="Sửa đề thi"
                        >
                          <Edit2 size={12} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(test.id, test.title)}
                          className="focus-ring inline-flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-white text-slate-500 hover:text-red-600 hover:border-red-600 transition cursor-pointer"
                          title="Xóa đề thi"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
