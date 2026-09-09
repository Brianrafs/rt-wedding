import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { getCurrentAdmin } from "@/lib/auth";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { adminEyebrow, textButton } from "@/components/ui/styles";

export const metadata: Metadata = { title: "Acesso administrativo | Ryelthon & Thayna" };

export default async function AdminLoginPage() {
  if (await getCurrentAdmin()) redirect("/admin");
  return (
    <main className="grid min-h-svh place-items-center bg-soft-lilac px-6 py-8">
      <section className="w-[min(100%,430px)] rounded-xl border border-border bg-background px-6 py-8 sm:p-11" aria-labelledby="login-heading">
        <p className="font-display text-xl">Ryelthon <span className="text-primary-hover italic">&</span> Thayna</p>
        <p className={`${adminEyebrow} mt-8`}>Área reservada</p>
        <h1 className="mt-2 text-[clamp(1.8rem,5vw,2.4rem)] leading-[1.2] font-bold tracking-[-0.035em]" id="login-heading">Acesso administrativo</h1>
        <p className="mt-3 text-sm text-muted-foreground">Entre com as credenciais do casal para continuar.</p>
        <LoginForm />
        <Link className={`${textButton} mt-5`} href="/"><ArrowLeftIcon className="size-5" /> Voltar ao site</Link>
      </section>
    </main>
  );
}
