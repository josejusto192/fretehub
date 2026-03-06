export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Sidebar } from "@/components/shared/Sidebar";

export default async function CaminhoneiroLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session || (session.role !== "caminhoneiro" && session.role !== "admin")) {
    redirect("/login");
  }

  if (session.status === "bloqueado") redirect("/login");

  const admin = createAdminClient();
  const { data: caminhoneiro } = await admin
    .from("caminhoneiros")
    .select("nome_completo")
    .eq("id", session.userId)
    .single();

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <Sidebar role="caminhoneiro" email={session.email} name={caminhoneiro?.nome_completo} />
      <div className="lg:ml-64 pt-14 lg:pt-0">
        <main className="p-6 max-w-5xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
