import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { localeCookieName, resolveLocale } from "@/lib/i18n/config";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { locale?: string };
  const locale = resolveLocale(body.locale);
  const cookieStore = await cookies();

  cookieStore.set(localeCookieName, locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });

  return NextResponse.json({ ok: true, locale });
}
