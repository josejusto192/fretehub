export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/shared/Navbar";

export default async function CaminhoneiroLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "caminhoneiro" && session.role !== "admin") {
    redirect("/login");
  }

  const caminhoneiro = await prisma.caminhoneiro.findUnique({
    where: { id: session.userId },
    select: { nome_completo: true },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        role="caminhoneiro"
        email={session.email}
        name={caminhoneiro?.nome_completo}
      />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
