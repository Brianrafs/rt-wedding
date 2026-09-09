import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { getCurrentAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Acesso administrativo | Ryelthon & Thayna" };

export default async function AdminLoginPage() {
  if (await getCurrentAdmin()) redirect("/admin");
  return (
    <main className="admin-login-page">
      <section className="admin-login-panel" aria-labelledby="login-heading">
        <p className="admin-brand">Ryelthon <span>&</span> Thayna</p>
        <p className="admin-eyebrow">Área reservada</p>
        <h1 id="login-heading">Acesso administrativo</h1>
        <p>Entre com as credenciais do casal para continuar.</p>
        <LoginForm />
        <Link href="/">Voltar ao site</Link>
      </section>
    </main>
  );
}
