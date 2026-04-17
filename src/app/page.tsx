import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-16">
      <section className="space-y-4">
        <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
          Metin2 CMS bootstrap
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-neutral-950">
          Modern CMS foundation for Metin2
        </h1>
        <p className="max-w-2xl text-base leading-7 text-neutral-700">
          This repository starts with a server-first Next.js foundation for a
          modern Metin2 CMS. The first milestone focuses on legacy-compatible
          login and registration against the live account database contract.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-neutral-200 p-5 shadow-sm">
          <h2 className="text-lg font-medium text-neutral-950">Phase 1</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-700">
            Bootstrap the repository, document the live schema, and prepare the
            auth/session boundaries.
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 p-5 shadow-sm">
          <h2 className="text-lg font-medium text-neutral-950">Current auth slice</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-700">
            Sign in, register a legacy-compatible account, recover a password,
            and reach the first protected account page backed by CMS-owned
            sessions.
          </p>
        </article>
      </section>

      <section className="flex flex-wrap gap-3">
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-xl bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          Go to login
        </Link>
        <Link
          href="/register"
          className="inline-flex items-center justify-center rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:border-neutral-950"
        >
          Create account
        </Link>
        <Link
          href="/recover"
          className="inline-flex items-center justify-center rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:border-neutral-950"
        >
          Recover password
        </Link>
      </section>
    </main>
  );
}
