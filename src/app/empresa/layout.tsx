export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Sidebar } from "@/components/shared/Sidebar";

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
      <div className="lg:ml-64 pt-14 lg:pt-0">
        <main className="p-6 max-w-5xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
