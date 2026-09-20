import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabase-server";

export async function getCurrentAdmin() {
  const cookieStore = await cookies();

  const accessToken =
    cookieStore.get("sb-access-token")?.value;

  if (!accessToken) {
    return null;
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseServer.auth.getUser(
    accessToken
  );

  if (userError || !user) {
    return null;
  }

  const { data: admin, error: adminError } =
    await supabaseServer
      .from("admin_users")
      .select(
        "id, full_name, email, role, is_active"
      )
      .eq("id", user.id)
      .maybeSingle();

  if (adminError || !admin) {
    return null;
  }

  if (!admin.is_active) {
    return null;
  }

  return admin;
}