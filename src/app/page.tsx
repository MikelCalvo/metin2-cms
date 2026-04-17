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
          <h2 className="text-lg font-medium text-neutral-950">Next step</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-700">
            Implement login and register flows compatible with the current
            legacy Metin2 account table.
          </p>
        </article>
      </section>
    </main>
  );
}
