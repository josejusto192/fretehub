import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/", "/login", "/cadastro/empresa", "/cadastro/caminhoneiro"];

const roleRoutes: Record<string, string> = {
  empresa: "/empresa",
  caminhoneiro: "/caminhoneiro",
  admin: "/admin",
};

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

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (
    publicRoutes.includes(pathname) ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return supabaseResponse;
  }

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = user.user_metadata?.role as string;

  for (const [routeRole, routePrefix] of Object.entries(roleRoutes)) {
    if (pathname.startsWith(routePrefix)) {
      if (role !== routeRole && role !== "admin") {
        return NextResponse.redirect(new URL(getDashboardUrl(role), request.url));
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
