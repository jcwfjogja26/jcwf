import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: Request) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          const cookieHeader =
            request.headers.get("cookie");

          if (!cookieHeader) {
            return [];
          }

          return cookieHeader
            .split("; ")
            .map((cookie) => {
              const [name, ...rest] =
                cookie.split("=");

              return {
                name,
                value: rest.join("="),
              };
            });
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value, options }) => {
              response.cookies.set(
                name,
                value,
                options
              );
            }
          );
        },
      },
    }
  );

  /*
   * Refresh / validate Supabase session.
   */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = new URL(request.url).pathname;

  const isAdminRoute =
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  const isLoginPage =
    pathname === "/admin/login";

  /*
   * Not logged in → protect admin pages.
   */
  if (isAdminRoute && !isLoginPage && !user) {
    const redirectResponse = NextResponse.redirect(
      new URL("/admin/login", request.url)
    );

    /*
     * Preserve Supabase cookies that may have been
     * refreshed during getUser().
     */
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(
        cookie.name,
        cookie.value
      );
    });

    return redirectResponse;
  }

  /*
   * Already logged in → don't show admin login.
   */
  if (isLoginPage && user) {
    const redirectResponse = NextResponse.redirect(
      new URL("/admin", request.url)
    );

    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(
        cookie.name,
        cookie.value
      );
    });

    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};