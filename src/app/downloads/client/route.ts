import { NextResponse } from "next/server";

import { getPublicEnv } from "@/lib/env";

export async function GET(request: Request) {
  const starterPackUrl = getPublicEnv().STARTER_PACK_URL;

  if (!starterPackUrl) {
    return NextResponse.redirect(new URL("/downloads", request.url));
  }

  return NextResponse.redirect(starterPackUrl);
}