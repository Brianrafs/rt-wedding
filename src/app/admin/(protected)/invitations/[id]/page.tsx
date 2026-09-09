import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { CopyCodeButton } from "@/components/admin/copy-code-button";
import { GuestForm } from "@/components/admin/guest-form";
import { InvitationEditForm } from "@/components/admin/invitation-edit-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireAdminPage } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getInvitation } from "@/services/admin.service";
import { ArrowLeftIcon, PencilIcon, PlusIcon, UsersIcon } from "@/components/ui/icons";
import { adminEyebrow, adminHeading, adminPage, panel, textButton } from "@/components/ui/styles";

export const metadata: Metadata = { title: "Editar convite | Administração" };

function responseDate(date: Date | null) {
  if (!date) return "Ainda não respondeu";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Fortaleza" }).format(date);
}

export default async function InvitationPage({ params }: PageProps<"/admin/invitations/[id]">) {
  await requireAdminPage();
  const { id } = await params;
  const invitation = await getInvitation(id, getDb());
  if (!invitation) notFound();
  return (
    <main className={adminPage} id="admin-content">
      <div className="mb-8 flex flex-col items-start gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className={adminEyebrow}>Convite</p><h1 className={adminHeading}>{invitation.name}</h1><p className="mt-2 text-muted-foreground">{invitation.guests.length} {invitation.guests.length === 1 ? "pessoa cadastrada" : "pessoas cadastradas"}</p></div>
        <ConfirmDeleteButton id={invitation.id} kind="invitation" label="Excluir convite" title="Excluir convite?" description="Todos os convidados vinculados também serão removidos. Esta ação não pode ser desfeita." />
      </div>

      <section className="admin-code-panel flex flex-col items-start gap-4 rounded-xl border border-border bg-soft-lilac p-5 sm:flex-row sm:items-center sm:justify-between" aria-labelledby="invitation-code-title">
        <div><h2 className="text-xl font-bold" id="invitation-code-title">Código do convite</h2><code className="mt-2.5 block text-xl font-bold tracking-[0.08em]">{invitation.code}</code><p className="mt-1.5 text-[0.7rem] text-muted-foreground">O código permanece o mesmo ao editar este cadastro.</p></div>
        <CopyCodeButton code={invitation.code} />
      </section>

      <section className={`${panel} mt-6 p-5`} aria-labelledby="invitation-details-title">
        <div className="mb-5"><div><h2 className="flex items-center gap-2 text-xl font-bold" id="invitation-details-title"><PencilIcon className="size-6 text-primary-hover" /> Dados do convite</h2><p className="mt-2 text-muted-foreground">Altere o nome usado para identificar este grupo.</p></div></div>
        <InvitationEditForm id={invitation.id} name={invitation.name} />
      </section>

      <section className={`${panel} mt-6 p-5`} aria-labelledby="add-guest-title">
        <div className="mb-5"><div><h2 className="flex items-center gap-2 text-xl font-bold" id="add-guest-title"><PlusIcon className="size-6 text-primary-hover" /> Adicionar convidado</h2><p className="mt-2 text-muted-foreground">Cadastre apenas o nome e indique se a pessoa precisa responder ao RSVP.</p></div></div>
        <GuestForm invitationId={invitation.id} />
      </section>

      <section className={`${panel} mt-6 p-5`} aria-labelledby="guest-list-title">
        <div className="mb-5"><div><h2 className="flex items-center gap-2 text-xl font-bold" id="guest-list-title"><UsersIcon className="size-6 text-primary-hover" /> Convidados</h2><p className="mt-2 text-muted-foreground">Consulte respostas e edite os dados individuais.</p></div></div>
        {invitation.guests.length === 0 ? <div className="rounded-xl border border-dashed border-border bg-background px-5 py-8 text-center"><h3 className="font-bold">Nenhum convidado neste convite</h3><p className="mx-auto mt-3 max-w-136 text-muted-foreground">Use o formulário acima para adicionar a primeira pessoa.</p></div> : (
          <div className="grid gap-4">{invitation.guests.map((guest) => {
            const hasResponse = guest.status !== "PENDING" || guest.respondedAt !== null;
            return (
              <article className="admin-guest-card rounded-[10px] border border-border bg-admin-background p-4" key={guest.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><h3 className="font-bold">{guest.name}</h3><p className="mt-1 text-[0.68rem] text-muted-foreground">{responseDate(guest.respondedAt)}</p></div>
                  <StatusBadge status={guest.status} requiresRsvp={guest.requiresRsvp} />
                </div>
                <details className="mt-4 border-t border-border"><summary className="flex min-h-11 w-fit cursor-pointer items-center gap-2 py-3 text-xs font-bold underline underline-offset-4"><PencilIcon className="size-5" /> Editar dados</summary><div className="pt-2"><GuestForm invitationId={invitation.id} guest={guest} /></div></details>
                <div className="mt-4 border-t border-border pt-2"><ConfirmDeleteButton id={guest.id} kind="guest" label="Remover convidado" title={`Remover ${guest.name}?`} description={hasResponse ? "Esta pessoa já respondeu. O status e todas as informações da resposta serão perdidos definitivamente." : "Esta pessoa será removida do convite. Esta ação não pode ser desfeita."} /></div>
              </article>
            );
          })}</div>
        )}
      </section>
    </main>
  );
}
