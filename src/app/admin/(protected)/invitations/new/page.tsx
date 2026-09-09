import type { Metadata } from "next";
import Link from "next/link";
import { InvitationCreateForm } from "@/components/admin/invitation-create-form";
import { requireAdminPage } from "@/lib/auth";

export const metadata: Metadata = { title: "Criar convite | Administração" };

export default async function NewInvitationPage() {
  await requireAdminPage();
  return (
    <main className="admin-page admin-form-page" id="admin-content">
      <Link className="admin-back-link" href="/admin/invitations">← Voltar para convites</Link>
      <div className="admin-page-heading"><div><p className="admin-eyebrow">Novo cadastro</p><h1>Criar convite</h1><p>Adicione o grupo e as pessoas que usarão o mesmo código.</p></div></div>
      <InvitationCreateForm />
    </main>
  );
}
