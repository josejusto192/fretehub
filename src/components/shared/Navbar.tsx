"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import {
  LayoutDashboard,
  PlusCircle,
  User,
  Search,
  ClipboardList,
  Users,
  Package,
  LogOut,
  ChevronDown,
  Truck,
  Menu,
  X,
} from "lucide-react";

interface NavbarProps {
  role: "empresa" | "caminhoneiro" | "admin";
  email: string;
  name?: string;
}

const navLinks = {
  empresa: [
    { href: "/empresa/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/empresa/fretes/novo", label: "Publicar Frete", icon: PlusCircle },
    { href: "/empresa/perfil", label: "Perfil", icon: User },
  ],
  caminhoneiro: [
    { href: "/caminhoneiro/dashboard", label: "Buscar Fretes", icon: Search },
    { href: "/caminhoneiro/candidaturas", label: "Candidaturas", icon: ClipboardList },
    { href: "/caminhoneiro/perfil", label: "Perfil", icon: User },
  ],
  admin: [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/usuarios", label: "Usuários", icon: Users },
    { href: "/admin/fretes", label: "Fretes", icon: Package },
  ],
};

const roleLabel = {
  empresa: "Empresa",
  caminhoneiro: "Caminhoneiro",
  admin: "Admin",
};

const roleBadgeColor = {
  empresa: "bg-blue-100 text-blue-800",
  caminhoneiro: "bg-amber-100 text-amber-800",
  admin: "bg-purple-100 text-purple-800",
};

export function Navbar({ role, email, name }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Desktop Nav */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-900 to-blue-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-lg text-blue-900 tracking-tight">
                Frete<span className="text-amber-500">Hub</span>
              </span>
            </Link>

            {/* Desktop Nav links */}
            <nav className="hidden md:flex items-center gap-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-blue-50 text-blue-900"
                        : "text-gray-600 hover:text-blue-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right side: user menu + mobile hamburger */}
          <div className="flex items-center gap-2">
            {/* Desktop user menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2 hover:bg-gray-50 rounded-xl"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-blue-900 to-blue-600 text-white text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-semibold text-gray-900 max-w-[140px] truncate leading-tight">
                      {name || email}
                    </span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${roleBadgeColor[role]}`}>
                      {roleLabel[role]}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 mt-1 shadow-lg">
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold text-gray-900 truncate">{name}</p>
                  <p className="text-xs text-gray-500 truncate">{email}</p>
                </div>
                <DropdownMenuSeparator />
                {links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <DropdownMenuItem key={link.href} asChild>
                      <Link href={link.href} className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-gray-500" />
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="text-red-600 focus:text-red-600 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {loggingOut ? "Saindo..." : "Sair da conta"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-blue-900 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <nav className="container mx-auto px-4 py-3 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-900"
                      : "text-gray-600 hover:text-blue-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-gray-100 mt-2">
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full"
              >
                <LogOut className="w-4 h-4" />
                {loggingOut ? "Saindo..." : "Sair da conta"}
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
