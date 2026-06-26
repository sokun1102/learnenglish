import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { AdminSettings } from "@/components/admin-settings";
import { getSystemSettings } from "@/lib/actions/settings-actions";
import { getCurrentUser } from "@/lib/actions/auth-actions";

export const metadata: Metadata = {
  title: "Cấu hình hệ thống | IELTS Admin Portal",
  description: "Trang cấu hình hệ thống và trạng thái kết nối cơ sở dữ liệu."
};

// Disable static generation since this page reads live connection/settings status on-demand
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "admin") {
    redirect("/profile");
  }

  const settings = await getSystemSettings();

  return (
    <SiteShell>
      <AdminSettings initialSettings={settings} />
    </SiteShell>
  );
}
