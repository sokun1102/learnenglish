"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, Save, RefreshCw, Database, Server } from "lucide-react";
import { updateSystemSettings, checkServicesHealth } from "@/lib/actions/settings-actions";
import type { SystemSettingsDocument } from "@/models/system-settings";

export function AdminSettings({ initialSettings }: { initialSettings: SystemSettingsDocument }) {
  const [settings, setSettings] = useState<SystemSettingsDocument>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [health, setHealth] = useState<{
    dbStatus: "connected" | "error";
    s3Status: "connected" | "error";
    dbError?: string;
    s3Error?: string;
  } | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  async function checkHealth() {
    setIsCheckingHealth(true);
    try {
      const status = await checkServicesHealth();
      setHealth(status);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingHealth(false);
    }
  }

  useEffect(() => {
    checkHealth();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await updateSystemSettings({
        siteTitle: settings.siteTitle,
        maintenanceMode: settings.maintenanceMode,
        defaultGradingStrict: settings.defaultGradingStrict,
        allowAnonymousPractice: settings.allowAnonymousPractice,
        minioBucketName: settings.minioBucketName
      });
      setSettings(updated);
      alert("Lưu cấu hình thành công!");
    } catch (error: any) {
      alert("Đã xảy ra lỗi khi lưu cấu hình: " + error.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
      <form onSubmit={handleSave} className="paper-panel rounded-lg p-6">
        <div className="mb-5 border-b border-line pb-4">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-moss">
            System Config
          </p>
          <h1 className="text-3xl font-bold text-ink">Cấu hình hệ thống</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/70">
            Quản lý các thiết lập vận hành của nền tảng thi thử IELTS. Các cấu hình được lưu trực tiếp vào MongoDB.
          </p>
        </div>

        <div className="grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-bold text-ink">Tiêu đề Website (Site Title)</span>
            <input
              type="text"
              required
              className="focus-ring rounded-md border border-line bg-white px-3 py-3 text-sm text-ink"
              value={settings.siteTitle}
              onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-bold text-ink">Tên Bucket Lưu Trữ Audio (MinIO/S3 Bucket)</span>
            <input
              type="text"
              required
              className="focus-ring rounded-md border border-line bg-white px-3 py-3 text-sm text-ink"
              value={settings.minioBucketName}
              onChange={(e) => setSettings({ ...settings, minioBucketName: e.target.value })}
            />
          </label>

          <hr className="border-line" />

          <h2 className="text-base font-bold text-ink mb-1">Cài đặt vận hành</h2>

          <div className="grid gap-3">
            <label className="flex items-start gap-3 rounded-md border border-line bg-white p-3 cursor-pointer hover:bg-paper/50">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-line text-moss focus:ring-moss"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              />
              <div>
                <span className="text-sm font-bold text-ink">Chế độ bảo trì (Maintenance Mode)</span>
                <p className="text-xs text-ink/65 mt-0.5">
                  Tạm thời chặn học sinh truy cập luyện tập để nâng cấp hệ thống.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-md border border-line bg-white p-3 cursor-pointer hover:bg-paper/50">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-line text-moss focus:ring-moss"
                checked={settings.defaultGradingStrict}
                onChange={(e) => setSettings({ ...settings, defaultGradingStrict: e.target.checked })}
              />
              <div>
                <span className="text-sm font-bold text-ink">Chấm điểm nghiêm ngặt mặc định (Strict Grading)</span>
                <p className="text-xs text-ink/65 mt-0.5">
                  Phân biệt chữ hoa/thường và không bỏ qua dấu câu thừa ở cuối câu trả lời.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-md border border-line bg-white p-3 cursor-pointer hover:bg-paper/50">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-line text-moss focus:ring-moss"
                checked={settings.allowAnonymousPractice}
                onChange={(e) => setSettings({ ...settings, allowAnonymousPractice: e.target.checked })}
              />
              <div>
                <span className="text-sm font-bold text-ink">Cho phép luyện tập tự do</span>
                <p className="text-xs text-ink/65 mt-0.5">
                  Học sinh có thể bắt đầu luyện thi thử mà không bắt buộc phải đăng nhập.
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="focus-ring inline-flex items-center gap-2 rounded-md bg-moss px-5 py-3 text-sm font-bold text-white transition hover:bg-moss/90 disabled:cursor-not-allowed disabled:bg-ink/30"
          >
            <Save size={16} aria-hidden="true" />
            {isSaving ? "Đang lưu..." : "Lưu cấu hình"}
          </button>
        </div>
      </form>

      <aside className="paper-panel h-fit rounded-lg p-5 lg:sticky lg:top-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold text-ink">Trạng thái kết nối</h2>
          <button
            onClick={checkHealth}
            disabled={isCheckingHealth}
            className="p-1.5 rounded-md hover:bg-paper text-ink/65 hover:text-ink disabled:opacity-50"
            title="Kiểm tra lại"
            type="button"
          >
            <RefreshCw size={16} className={isCheckingHealth ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="grid gap-3">
          {/* MongoDB Health */}
          <div className="rounded-md border border-line bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                <Database size={16} className="text-ink/60" />
                MongoDB
              </span>
              {health?.dbStatus === "connected" ? (
                <span className="inline-flex items-center gap-1 rounded bg-moss/10 px-2 py-0.5 text-xs font-bold text-moss">
                  <CheckCircle2 size={12} />
                  Connected
                </span>
              ) : health?.dbStatus === "error" ? (
                <span className="inline-flex items-center gap-1 rounded bg-coral/10 px-2 py-0.5 text-xs font-bold text-coral">
                  <AlertTriangle size={12} />
                  Offline
                </span>
              ) : (
                <span className="text-xs text-ink/40">Đang quét...</span>
              )}
            </div>
            {health?.dbError && (
              <p className="mt-2 text-xs text-coral leading-5 break-words">{health.dbError}</p>
            )}
          </div>

          {/* S3/MinIO Health */}
          <div className="rounded-md border border-line bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                <Server size={16} className="text-ink/60" />
                MinIO / S3
              </span>
              {health?.s3Status === "connected" ? (
                <span className="inline-flex items-center gap-1 rounded bg-moss/10 px-2 py-0.5 text-xs font-bold text-moss">
                  <CheckCircle2 size={12} />
                  Connected
                </span>
              ) : health?.s3Status === "error" ? (
                <span className="inline-flex items-center gap-1 rounded bg-coral/10 px-2 py-0.5 text-xs font-bold text-coral">
                  <AlertTriangle size={12} />
                  Offline
                </span>
              ) : (
                <span className="text-xs text-ink/40">Đang quét...</span>
              )}
            </div>
            {health?.s3Error && (
              <p className="mt-2 text-xs text-coral leading-5 break-words">
                {health.s3Error}. Đảm bảo MinIO server đang bật ở endpoint của bạn.
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 rounded-md bg-paper p-3 text-xs leading-5 text-ink/60">
          Trạng thái kết nối sẽ được quét tự động khi mở trang. Các lỗi cấu hình và mạng có thể ảnh hưởng đến tiến trình làm bài và lưu trữ dữ liệu của học viên.
        </div>
      </aside>
    </div>
  );
}
