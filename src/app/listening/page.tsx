import type { Metadata } from "next";
import { getTests } from "@/lib/actions/test-actions";
import { SiteShell } from "@/components/site-shell";
import { StudentTestList } from "@/components/student-test-list";

export const metadata: Metadata = {
  title: "Luyện nghe IELTS Listening | Prep Master",
  description: "Luyện tập các đề thi thử IELTS Listening với tệp âm thanh chất lượng cao, phản hồi đáp án tức thì."
};

export const dynamic = "force-dynamic";

export default async function ListeningPage() {
  const allTests = await getTests();
  const listeningTests = allTests.filter(
    (t) => t.skill === "listening" && t.status === "published"
  );

  return (
    <SiteShell>
      <StudentTestList initialTests={listeningTests} skill="listening" />
    </SiteShell>
  );
}
