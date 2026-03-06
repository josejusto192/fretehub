import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface UserSession {
  userId: string;
  email: string;
  role: "empresa" | "caminhoneiro" | "admin";
  status: "pendente" | "ativo" | "bloqueado";
}

export async function getSession(): Promise<UserSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("users")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return {
    userId: user.id,
    email: user.email!,
    role: profile.role,
    status: profile.status,
  };
}
