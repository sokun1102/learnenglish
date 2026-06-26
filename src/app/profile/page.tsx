import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { StudentProfile } from "@/components/student-profile";
import { getCurrentUser } from "@/lib/actions/auth-actions";
import { getStudentAttemptHistory } from "@/lib/actions/profile-actions";

export const metadata: Metadata = {
  title: "Hồ sơ cá nhân | IELTS Practice Platform",
  description: "Quản lý thông tin học viên, xem lịch sử làm bài thi thử IELTS."
};

// Force dynamic fetch since it reads session cookies on demand
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const attempts = user ? await getStudentAttemptHistory() : [];

  return (
    <SiteShell>
      <StudentProfile initialUser={user} initialAttempts={attempts} />
    </SiteShell>
  );
}
