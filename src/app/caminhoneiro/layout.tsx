export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Navbar } from "@/components/shared/Navbar";

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
    <div className="min-h-screen bg-gray-50">
      <Navbar role="caminhoneiro" email={session.email} name={caminhoneiro?.nome_completo} />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
