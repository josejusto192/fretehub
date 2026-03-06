export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Sidebar } from "@/components/shared/Sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <Sidebar role="admin" email={session.email} name="Admin" />
      <div className="lg:ml-64 pt-14 lg:pt-0">
        <main className="p-6 max-w-5xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
