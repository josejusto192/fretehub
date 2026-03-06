"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavbarProps {
  role: "empresa" | "caminhoneiro" | "admin";
  email: string;
  name?: string;
}

const navLinks = {
  empresa: [
    { href: "/empresa/dashboard", label: "Dashboard" },
    { href: "/empresa/fretes/novo", label: "Publicar Frete" },
    { href: "/empresa/perfil", label: "Perfil" },
  ],
  caminhoneiro: [
    { href: "/caminhoneiro/dashboard", label: "Buscar Fretes" },
    { href: "/caminhoneiro/candidaturas", label: "Minhas Candidaturas" },
    { href: "/caminhoneiro/perfil", label: "Perfil" },
  ],
  admin: [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/usuarios", label: "Usuários" },
    { href: "/admin/fretes", label: "Fretes" },
  ],
};

export function Navbar({ role, email, name }: NavbarProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const links = navLinks[role] || [];
  const initials = (name || email).slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      toast.error("Erro ao sair");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🚛</span>
            <span className="font-bold text-blue-900">FreteHub</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-600 hover:text-blue-900 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-100 text-blue-900 text-sm font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block text-sm text-gray-700 max-w-[150px] truncate">
                {name || email}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5 text-xs text-gray-500 truncate">{email}</div>
            <DropdownMenuSeparator />
            {links.map((link) => (
              <DropdownMenuItem key={link.href} asChild>
                <Link href={link.href}>{link.label}</Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-red-600"
            >
              {loggingOut ? "Saindo..." : "Sair"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
