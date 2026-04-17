import { redirect } from "next/navigation";

import { logoutAction } from "@/app/auth/actions";
import { getCurrentAuthenticatedAccount } from "@/server/auth/current-account";

export default async function AccountPage() {
  const authenticated = await getCurrentAuthenticatedAccount();

  if (!authenticated) {
    redirect("/login");
  }

  const { account } = authenticated;

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
