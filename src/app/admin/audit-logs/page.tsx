import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { getCurrentUser } from "@/lib/actions/auth-actions";
import { getAuditLogs } from "@/lib/actions/log-actions";
import { ShieldCheck } from "lucide-react";

import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Nhật ký hoạt động | IELTS Admin Portal",
  description: "Trang ghi nhận nhật ký bảo mật của ban quản trị hệ thống."
};

// Force dynamic query since this loads dynamic logs on page request
export const dynamic = "force-dynamic";

export default async function AdminAuditLogsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "admin") {
    redirect("/profile");
  }

  const logs = await getAuditLogs();

  return (
    <SiteShell>
      <section className="paper-panel rounded-lg p-6">
        <div className="flex items-center gap-3 border-b border-line pb-4 mb-5">
          <div className="rounded-md bg-moss/10 p-2.5 text-moss">
            <ShieldCheck size={28} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-moss">Audit System</p>
            <h1 className="text-3xl font-bold text-ink">Nhật ký hoạt động Admin</h1>
          </div>
        </div>

        <p className="text-sm text-ink/70 mb-5 leading-6">
          Dưới đây là danh sách ghi nhận các hành vi nhạy cảm và thay đổi cấu hình hệ thống do ban quản trị thực hiện trong 90 ngày gần nhất.
        </p>

        <div className="overflow-x-auto rounded-lg border border-line bg-white">
          <table className="w-full border-collapse text-left text-sm text-ink">
            <thead className="bg-paper font-semibold text-ink/75 border-b border-line">
              <tr>
                <th className="px-4 py-3.5">Thời gian</th>
                <th className="px-4 py-3.5">Quản trị viên</th>
                <th className="px-4 py-3.5">Hành động</th>
                <th className="px-4 py-3.5">Đối tượng tác động</th>
                <th className="px-4 py-3.5">Địa chỉ IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-ink/50 italic">
                    Chưa ghi nhận hoạt động nào của quản trị viên.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-paper/30 transition">
                    <td className="px-4 py-3.5 text-xs font-mono text-ink/65">
                      {new Date(log.timestamp).toLocaleString("vi-VN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit"
                      })}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-ink">{log.adminEmail}</td>
                    <td className="px-4 py-3.5">
                      <span className="rounded bg-gold/15 px-2.5 py-1 text-xs font-bold text-gold uppercase tracking-wider">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-ink/80">{log.target}</td>
                    <td className="px-4 py-3.5 text-xs font-mono text-ink/60">{log.ipAddress || "127.0.0.1"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </SiteShell>
  );
}
