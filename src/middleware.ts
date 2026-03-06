import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-in-production"
);

// Rotas públicas que não requerem autenticação
const publicRoutes = ["/", "/login", "/cadastro/empresa", "/cadastro/caminhoneiro"];

// Rotas por role
const roleRoutes: Record<string, string[]> = {
  empresa: ["/empresa"],
  caminhoneiro: ["/caminhoneiro"],
  admin: ["/admin"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rotas públicas e de API
  if (
    publicRoutes.includes(pathname) ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("fretehub-token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = payload.role as string;
    const status = payload.status as string;

    // Bloquear usuários bloqueados
    if (status === "bloqueado") {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("fretehub-token");
      return response;
    }

    // Verificar acesso por role
    for (const [routeRole, routes] of Object.entries(roleRoutes)) {
      if (routes.some((route) => pathname.startsWith(route))) {
        if (role !== routeRole && role !== "admin") {
          // Redirecionar para o dashboard correto
          const dashboardUrl = getDashboardUrl(role);
          return NextResponse.redirect(new URL(dashboardUrl, request.url));
        }
      }
    }

    // Adicionar dados do usuário no header para uso nos Server Components
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId as string);
    requestHeaders.set("x-user-role", role);
    requestHeaders.set("x-user-email", payload.email as string);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("fretehub-token");
    return response;
  }
}

function getDashboardUrl(role: string): string {
  switch (role) {
    case "empresa":
      return "/empresa/dashboard";
    case "caminhoneiro":
      return "/caminhoneiro/dashboard";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/login";
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
