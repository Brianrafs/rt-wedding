import type { Metadata } from "next";
import Link from "next/link";
import { InvitationCreateForm } from "@/components/admin/invitation-create-form";
import { requireAdminPage } from "@/lib/auth";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { adminEyebrow, adminHeading, adminPage, textButton } from "@/components/ui/styles";

export const metadata: Metadata = { title: "Criar convite | Administração" };

export default async function NewInvitationPage() {
  await requireAdminPage();
  return (
    <main className={`${adminPage} max-w-205`} id="admin-content">
      <div className="mb-8"><div><p className={adminEyebrow}>Novo cadastro</p><h1 className={adminHeading}>Criar convite</h1><p className="mt-2 text-muted-foreground">Adicione o grupo e as pessoas que usarão o mesmo código.</p></div></div>
      <InvitationCreateForm />
    </main>
  );
}
