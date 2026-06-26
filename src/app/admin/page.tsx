import Link from "next/link";
import { redirect } from "next/navigation";
import { FilePlus2, Settings, ShieldAlert, BookOpen } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { getAllTestsForAdmin } from "@/lib/actions/test-actions";
import { getCurrentUser } from "@/lib/actions/auth-actions";
import { TestCmsTable } from "@/components/test-cms-table";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "admin") {
    redirect("/profile");
  }

  // Load all tests including draft/archived for management
  const tests = await getAllTestsForAdmin();

  return (
    <SiteShell>
      <div className="space-y-6">
        {/* Header Title with quick link action controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Admin Portal</span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">IELTS Content Management System (CMS)</h1>
            <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
              Quản lý danh sách đề thi IELTS, thiết lập trạng thái phát hành (Draft/Published/Archived), sửa đổi nội dung và cấu hình hệ thống.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/settings"
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              <Settings size={14} />
              Cấu hình hệ thống
            </Link>
            <Link
              href="/admin/tests/new"
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/10 cursor-pointer"
            >
              <FilePlus2 size={14} />
              Tạo đề thi mới
            </Link>
          </div>
        </div>

        {/* Dashboard quick widgets cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/admin/tests/new"
            className="focus-ring flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-600 hover:bg-blue-50/5 transition shadow-sm"
          >
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tạo đề thi</p>
              <p className="text-sm font-black text-slate-800 mt-1 leading-none">Reading & Listening</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <FilePlus2 size={16} />
            </div>
          </Link>

          <Link
            href="/admin/settings"
            className="focus-ring flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-600 hover:bg-blue-50/5 transition shadow-sm"
          >
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cấu hình</p>
              <p className="text-sm font-black text-slate-800 mt-1 leading-none">Database & MinIO/S3</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <Settings size={16} />
            </div>
          </Link>

          <Link
            href="/admin/audit-logs"
            className="focus-ring flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-600 hover:bg-blue-50/5 transition shadow-sm"
          >
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nhật ký hoạt động</p>
              <p className="text-sm font-black text-slate-800 mt-1 leading-none">Lịch sử tác vụ admin</p>
            </div>
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
              <ShieldAlert size={16} />
            </div>
          </Link>
        </div>

        {/* CMS Table Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-blue-600" />
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">Danh sách đề thi đang có ({tests.length})</h2>
          </div>
          <TestCmsTable initialTests={tests} />
        </div>
      </div>
    </SiteShell>
  );
}
