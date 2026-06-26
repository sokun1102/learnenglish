import { redirect } from "next/navigation";
import { AdminTestEditor } from "@/components/admin-test-editor";
import { SiteShell } from "@/components/site-shell";
import { getCurrentUser } from "@/lib/actions/auth-actions";
import { getTestById } from "@/lib/actions/test-actions";

export default async function NewTestPage({
  searchParams
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "admin") {
    redirect("/profile");
  }

  const { id } = await searchParams;
  const test = id ? await getTestById(id) : null;

  return (
    <SiteShell>
      <AdminTestEditor initialTest={test} />
    </SiteShell>
  );
}
