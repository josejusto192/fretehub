export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Sidebar } from "@/components/shared/Sidebar";
import { BottomNav } from "@/components/shared/BottomNav";

export default async function EmpresaLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session || (session.role !== "empresa" && session.role !== "admin")) {
    redirect("/login");
  }

  if (session.status === "bloqueado") redirect("/login");

  const admin = createAdminClient();
  const { data: empresa } = await admin
    .from("empresas")
    .select("razao_social")
    .eq("id", session.userId)
    .single();

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <Sidebar role="empresa" email={session.email} name={empresa?.razao_social} />
      <BottomNav role="empresa" />
      <div className="lg:ml-64 pt-14 lg:pt-0 pb-20 lg:pb-0">
        <main className="p-4 lg:p-6 max-w-5xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
