export const dynamic = "force-dynamic";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/shared/Navbar";

export default async function EmpresaLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "empresa" && session.role !== "admin") {
    redirect("/login");
  }

  const empresa = await prisma.empresa.findUnique({
    where: { id: session.userId },
    select: { razao_social: true },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        role="empresa"
        email={session.email}
        name={empresa?.razao_social}
      />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
