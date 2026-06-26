import type { Metadata } from "next";
import { getTests } from "@/lib/actions/test-actions";
import { SiteShell } from "@/components/site-shell";
import { StudentTestList } from "@/components/student-test-list";

export const metadata: Metadata = {
  title: "Luyện đọc IELTS Reading | Prep Master",
  description: "Thư viện đề thi thử và bài tập luyện đọc IELTS Reading phong phú, chuẩn cấu trúc đề thi thật."
};

export const dynamic = "force-dynamic";

export default async function ReadingPage() {
  const allTests = await getTests();
  const readingTests = allTests.filter(
    (t) => t.skill === "reading" && t.status === "published"
  );

  return (
    <SiteShell>
      <StudentTestList initialTests={readingTests} skill="reading" />
    </SiteShell>
  );
}
