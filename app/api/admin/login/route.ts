import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-admin-auth";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        {
          message: "Email dan password wajib diisi.",
        },
        { status: 400 }
      );
    }

    // Supabase Auth client → untuk login & menyimpan session
    const supabase = await createSupabaseServerClient();

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError || !authData.user) {
      console.error("ADMIN AUTH LOGIN ERROR:", authError);

      return NextResponse.json(
        {
          message: "Email atau password salah.",
        },
        { status: 401 }
      );
    }

    // Secret-key client → bypass RLS untuk mengecek admin_users
    const { data: adminUser, error: adminError } =
      await supabaseServer
        .from("admin_users")
        .select("id, full_name, email, role, is_active")
        .eq("id", authData.user.id)
        .maybeSingle();

    if (adminError) {
      console.error("GET ADMIN USER ERROR:", adminError);

      await supabase.auth.signOut();

      return NextResponse.json(
        {
          message: "Gagal memverifikasi akun admin.",
        },
        { status: 500 }
      );
    }

    if (!adminUser) {
      await supabase.auth.signOut();

      return NextResponse.json(
        {
          message: "Akun ini tidak memiliki akses admin.",
        },
        { status: 403 }
      );
    }

    if (!adminUser.is_active) {
      await supabase.auth.signOut();

      return NextResponse.json(
        {
          message: "Akun admin ini sedang dinonaktifkan.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: adminUser.id,
        fullName: adminUser.full_name,
        email: adminUser.email,
        role: adminUser.role,
      },
    });
  } catch (error) {
    console.error("ADMIN LOGIN SERVER ERROR:", error);

    return NextResponse.json(
      {
        message: "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}