import { cookies } from "next/headers";

import { defaultLocale, localeCookieName, resolveLocale, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

export async function getCurrentLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies();
    return resolveLocale(cookieStore.get(localeCookieName)?.value);
  } catch {
    return defaultLocale;
  }
}

export async function getMessagesForRequest() {
  return getMessages(await getCurrentLocale());
}
