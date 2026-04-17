import "server-only";

import { cookies } from "next/headers";

import type { IssueSessionInput, SessionContext } from "@/server/auth/types";
import {
  createWebSession,
  findActiveSessionById,
  listActiveSessionsForAccount,
  revokeActiveSessionsForAccount,
  revokeOtherActiveSessionsForAccount,
  revokeWebSession,
  touchActiveSessionLastSeen,
} from "@/server/session/session-repository";

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "mt2cms_session";
const SESSION_COOKIE_SECURE = process.env.SESSION_COOKIE_SECURE === "true";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function toMysqlDateTime(date: Date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

export async function issueAuthenticatedSession(
  input: IssueSessionInput,
): Promise<SessionContext> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_MAX_AGE_SECONDS * 1000);
  const session: SessionContext = {
    id: globalThis.crypto.randomUUID(),
    accountId: input.accountId,
    login: input.login,
    ip: input.ip ?? null,
    userAgent: input.userAgent ?? null,
    createdAt: toMysqlDateTime(now),
    lastSeenAt: toMysqlDateTime(now),
    expiresAt: toMysqlDateTime(expiresAt),
  };

  await createWebSession(session);

  const cookieStore = await cookies();
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: session.id,
    httpOnly: true,
    sameSite: "lax",
    secure: SESSION_COOKIE_SECURE,
    path: "/",
    expires: expiresAt,
  });

  return session;
}

export async function getCurrentAuthenticatedSession() {
  const cookieStore = await cookies();
  const currentSession = cookieStore.get(SESSION_COOKIE_NAME);

  if (!currentSession?.value) {
    return null;
  }

  const now = toMysqlDateTime(new Date());
  const session = await findActiveSessionById(currentSession.value, now);

  if (!session) {
    return null;
  }

  await touchActiveSessionLastSeen(session.id, now, now);

  return {
    ...session,
    lastSeenAt: now,
  };
}

export async function listAuthenticatedSessionsForAccount(accountId: number) {
  return listActiveSessionsForAccount(accountId, toMysqlDateTime(new Date()));
}

export async function revokeSessionById(sessionId: string): Promise<void> {
  await revokeWebSession(sessionId, toMysqlDateTime(new Date()));
}

export async function revokeOtherSessionsForAccount(
  accountId: number,
  currentSessionId: string,
): Promise<void> {
  await revokeOtherActiveSessionsForAccount(
    accountId,
    currentSessionId,
    toMysqlDateTime(new Date()),
  );
}

export async function revokeSessionsForAccount(accountId: number): Promise<void> {
  await revokeActiveSessionsForAccount(accountId, toMysqlDateTime(new Date()));
}

export async function clearAuthenticatedSession(): Promise<void> {
  const cookieStore = await cookies();
  const currentSession = cookieStore.get(SESSION_COOKIE_NAME);

  if (currentSession?.value) {
    await revokeSessionById(currentSession.value);
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}
