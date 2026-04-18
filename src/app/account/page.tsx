import { redirect } from "next/navigation";

import {
  closeOtherSessionsAction,
  revokeSessionAction,
} from "@/app/account/actions";
import { logoutAction } from "@/app/auth/actions";
import { ChangePasswordForm } from "@/components/account/change-password-form";
import { ProfileSettingsForm } from "@/components/account/profile-settings-form";
import { getCurrentAuthenticatedAccount } from "@/server/auth/current-account";
import { listRecentAuthActivityForAccount } from "@/server/auth/auth-audit-service";
import { buildAccountSecuritySummary } from "@/server/account/account-security-summary";
import { listAuthenticatedSessionsForAccount } from "@/server/session/session-service";

export default async function AccountPage() {
  const authenticated = await getCurrentAuthenticatedAccount();

  if (!authenticated) {
    redirect("/login");
  }

  const { account, session } = authenticated;
  const activeSessions = await listAuthenticatedSessionsForAccount(account.id);
  const recentAuthActivity = await listRecentAuthActivityForAccount(account.id);
  const securitySummary = buildAccountSecuritySummary({
    currentSessionId: session.id,
    activeSessions,
    recentAuthActivity,
  });
  const otherActiveSessions = activeSessions.filter(
    (activeSession) => activeSession.id !== session.id,
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-16">
      <section className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
          Authenticated account
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">
          Welcome, {account.login}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-neutral-600">
          This is the first protected area of the modern Metin2 CMS. It reads the
          authenticated session from the CMS-owned session store and loads the
          live legacy account record.
        </p>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-medium text-neutral-950">Security summary</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Quick overview of current web sessions and the most recent authentication
            events recorded for this account.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {securitySummary.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
                {item.label}
              </p>
              <p
                className={`mt-3 text-lg font-semibold tracking-tight ${
                  item.tone === "success"
                    ? "text-emerald-700"
                    : item.tone === "attention"
                      ? "text-amber-700"
                      : "text-neutral-950"
                }`}
              >
                {item.value}
              </p>
              <p className="mt-2 text-sm leading-6 text-neutral-600">{item.helper}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-medium text-neutral-950">Identity</h2>
          <dl className="mt-3 space-y-2 text-sm text-neutral-700">
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-500">Login</dt>
              <dd>{account.login}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-500">Email</dt>
              <dd>{account.email || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-500">Status</dt>
              <dd>{account.status}</dd>
            </div>
          </dl>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-medium text-neutral-950">Legacy balances</h2>
          <dl className="mt-3 space-y-2 text-sm text-neutral-700">
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-500">Cash</dt>
              <dd>{account.cash}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-500">Mileage</dt>
              <dd>{account.mileage}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-500">Last play</dt>
              <dd>{account.lastPlay}</dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ChangePasswordForm />
        <ProfileSettingsForm email={account.email} socialId={account.socialId} />
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-medium text-neutral-950">Web sessions</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Active CMS sessions tied to this account. Use this to spot stale
              browser sessions and close the ones you are not using anymore.
            </p>
          </div>

          {otherActiveSessions.length > 0 ? (
            <form action={closeOtherSessionsAction}>
              <button
                type="submit"
                className="inline-flex w-fit items-center justify-center rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:border-neutral-950"
              >
                Close other sessions
              </button>
            </form>
          ) : (
            <p className="max-w-sm text-xs leading-5 text-neutral-500 md:text-right">
              No other active sessions right now. The individual revoke control appears
              when this account is also signed in from another browser or device.
            </p>
          )}
        </div>

        <div className="mt-4 space-y-3">
          {activeSessions.map((activeSession) => {
            const isCurrentSession = activeSession.id === session.id;

            return (
              <article
                key={activeSession.id}
                className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-neutral-950">
                        {isCurrentSession ? "Current session" : "Active session"}
                      </p>
                      {isCurrentSession ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          Current
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-neutral-500">ID: {activeSession.id}</p>
                  </div>

                  {!isCurrentSession ? (
                    <form action={revokeSessionAction}>
                      <input type="hidden" name="sessionId" value={activeSession.id} />
                      <button
                        type="submit"
                        className="inline-flex w-fit items-center justify-center rounded-xl border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-900 transition hover:border-neutral-950"
                      >
                        Revoke session
                      </button>
                    </form>
                  ) : null}
                </div>

                <dl className="mt-4 grid gap-3 text-sm text-neutral-700 md:grid-cols-2">
                  <div>
                    <dt className="text-neutral-500">Last seen</dt>
                    <dd>{activeSession.lastSeenAt}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Created</dt>
                    <dd>{activeSession.createdAt}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">IP</dt>
                    <dd>{activeSession.ip || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">User agent</dt>
                    <dd className="break-all">{activeSession.userAgent || "—"}</dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-medium text-neutral-950">Recent auth activity</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Latest sign-in, recovery and account settings events recorded in the CMS
            audit log for this account.
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {recentAuthActivity.length > 0 ? (
            recentAuthActivity.map((entry) => (
              <article
                key={entry.id}
                className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-neutral-950">{entry.title}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          entry.success
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {entry.success ? "Success" : "Attention"}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600">{entry.description}</p>
                  </div>

                  <p className="text-xs text-neutral-500">{entry.occurredAt}</p>
                </div>

                <dl className="mt-4 grid gap-3 text-sm text-neutral-700 md:grid-cols-2">
                  <div>
                    <dt className="text-neutral-500">IP</dt>
                    <dd>{entry.ip || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">User agent</dt>
                    <dd className="break-all">{entry.userAgent || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Outcome</dt>
                    <dd>{entry.outcome}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Delivery</dt>
                    <dd>{entry.deliveryMode || "—"}</dd>
                  </div>
                </dl>
              </article>
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
              No auth activity recorded yet for this account.
            </p>
          )}
        </div>
      </section>

      <form action={logoutAction}>
        <button
          type="submit"
          className="inline-flex w-fit items-center justify-center rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:border-neutral-950"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
