"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  PlusCircle,
  User,
  Search,
  ClipboardList,
} from "lucide-react";

const routes = {
  empresa: [
    { href: "/empresa/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/empresa/fretes/ativos", icon: Activity, label: "Em Andamento" },
    { href: "/empresa/fretes/novo", icon: PlusCircle, label: "Publicar" },
    { href: "/empresa/perfil", icon: User, label: "Perfil" },
  ],
  caminhoneiro: [
    { href: "/caminhoneiro/dashboard", icon: Search, label: "Buscar" },
    { href: "/caminhoneiro/fretes/ativos", icon: Activity, label: "Ativos" },
    { href: "/caminhoneiro/candidaturas", icon: ClipboardList, label: "Candidaturas" },
    { href: "/caminhoneiro/perfil", icon: User, label: "Perfil" },
  ],
};

interface Props {
  role: "empresa" | "caminhoneiro" | "admin";
}

export function BottomNav({ role }: Props) {
  const pathname = usePathname();
  const links = routes[role as keyof typeof routes];
  if (!links) return null;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 px-1 rounded-xl transition-all ${
                isActive
                  ? "text-blue-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive ? "bg-blue-50" : ""
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? "text-blue-900" : "text-gray-400"
                  }`}
                />
              </div>
              <span
                className={`text-[10px] font-semibold leading-tight ${
                  isActive ? "text-blue-900" : "text-gray-400"
                }`}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
