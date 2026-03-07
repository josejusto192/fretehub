"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
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
  Truck,
  Menu,
  X,
  ChevronRight,
  Activity,
} from "lucide-react";

interface SidebarProps {
  role: "empresa" | "caminhoneiro" | "admin";
  email: string;
  name?: string;
}

const navLinks = {
  empresa: [
    { href: "/empresa/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/empresa/fretes/ativos", label: "Fretes em Andamento", icon: Activity },
    { href: "/empresa/fretes/novo", label: "Publicar Frete", icon: PlusCircle },
    { href: "/empresa/perfil", label: "Meu Perfil", icon: User },
  ],
  caminhoneiro: [
    { href: "/caminhoneiro/dashboard", label: "Buscar Fretes", icon: Search },
    { href: "/caminhoneiro/fretes/ativos", label: "Fretes Ativos", icon: Activity },
    { href: "/caminhoneiro/candidaturas", label: "Candidaturas", icon: ClipboardList },
    { href: "/caminhoneiro/perfil", label: "Meu Perfil", icon: User },
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
  admin: "Administrador",
};

const roleBadgeStyle = {
  empresa: "bg-blue-50 text-blue-700 border-blue-100",
  caminhoneiro: "bg-amber-50 text-amber-700 border-amber-100",
  admin: "bg-purple-50 text-purple-700 border-purple-100",
};

const roleAvatarStyle = {
  empresa: "from-blue-900 to-blue-600",
  caminhoneiro: "from-amber-600 to-amber-400",
  admin: "from-purple-800 to-purple-600",
};

export function Sidebar({ role, email, name }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
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

  const SidebarInner = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-900 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-lg text-blue-900 tracking-tight">
            Frete<span className="text-amber-500">Hub</span>
          </span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Role badge */}
      <div className="px-4 pt-4 pb-1">
        <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${roleBadgeStyle[role]}`}>
          {roleLabel[role]}
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? "bg-blue-900 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"
                }`}
              />
              <span className="flex-1">{link.label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/60" />}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3 px-1">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback
              className={`bg-gradient-to-br ${roleAvatarStyle[role]} text-white text-xs font-bold`}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
              {name || email}
            </p>
            <p className="text-xs text-gray-400 truncate">{email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-60"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {loggingOut ? "Saindo..." : "Sair da conta"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col z-30 shadow-sm">
        <SidebarInner />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-100 flex items-center px-4 justify-between z-30 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-900 to-blue-600 rounded-xl flex items-center justify-center">
            <Truck className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-base text-blue-900 tracking-tight">
            Frete<span className="text-amber-500">Hub</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback
              className={`bg-gradient-to-br ${roleAvatarStyle[role]} text-white text-xs font-bold`}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed left-0 top-0 h-full w-72 bg-white z-50 flex flex-col shadow-2xl transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarInner onClose={() => setMobileOpen(false)} />
      </aside>
    </>
  );
}
