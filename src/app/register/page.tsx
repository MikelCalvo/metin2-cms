import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/auth/register-form";
import { getCurrentAuthenticatedAccount } from "@/server/auth/current-account";

export default async function RegisterPage() {
  const authenticated = await getCurrentAuthenticatedAccount();

  if (authenticated) {
    redirect("/account");
  }

  return (
    <main className="min-h-screen bg-[#09090b] px-6 py-16 text-zinc-100">
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl flex-col justify-center">
        <RegisterForm />
      </div>
    </main>
  );
}
