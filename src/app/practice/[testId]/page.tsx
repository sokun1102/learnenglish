import { notFound } from "next/navigation";
import { PracticeWorkspace } from "@/components/practice-workspace";
import { SiteShell } from "@/components/site-shell";
import { getTestById } from "@/lib/actions/test-actions";

export default async function PracticePage({
  params
}: {
  params: Promise<{ testId: string }>;
}) {
  const { testId } = await params;
  const test = await getTestById(testId);

  if (!test) {
    notFound();
  }

  return (
    <SiteShell isExamMode={true}>
      <PracticeWorkspace test={test} />
    </SiteShell>
  );
}
