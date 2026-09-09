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
    <main className="admin-page admin-detail-page" id="admin-content">
      <Link className="admin-back-link" href="/admin/invitations">← Voltar para convites</Link>
      <div className="admin-page-heading">
        <div><p className="admin-eyebrow">Convite</p><h1>{invitation.name}</h1><p>{invitation.guests.length} {invitation.guests.length === 1 ? "pessoa cadastrada" : "pessoas cadastradas"}</p></div>
        <ConfirmDeleteButton id={invitation.id} kind="invitation" label="Excluir convite" title="Excluir convite?" description="Todos os convidados vinculados também serão removidos. Esta ação não pode ser desfeita." />
      </div>

      <section className="admin-code-panel" aria-labelledby="invitation-code-title">
        <div><h2 id="invitation-code-title">Código do convite</h2><code>{invitation.code}</code><p>O código permanece o mesmo ao editar este cadastro.</p></div>
        <CopyCodeButton code={invitation.code} />
      </section>

      <section className="admin-section" aria-labelledby="invitation-details-title">
        <div className="admin-section-heading"><div><h2 id="invitation-details-title">Dados do convite</h2><p>Altere o nome usado para identificar este grupo.</p></div></div>
        <InvitationEditForm id={invitation.id} name={invitation.name} />
      </section>

      <section className="admin-section" aria-labelledby="add-guest-title">
        <div className="admin-section-heading"><div><h2 id="add-guest-title">Adicionar convidado</h2><p>Novas pessoas começam aguardando resposta quando o RSVP é necessário.</p></div></div>
        <GuestForm invitationId={invitation.id} />
      </section>

      <section className="admin-section" aria-labelledby="guest-list-title">
        <div className="admin-section-heading"><div><h2 id="guest-list-title">Convidados</h2><p>Consulte respostas e edite os dados individuais.</p></div></div>
        {invitation.guests.length === 0 ? <div className="admin-empty-state is-compact"><h3>Nenhum convidado neste convite</h3><p>Use o formulário acima para adicionar a primeira pessoa.</p></div> : (
          <div className="admin-guest-list">{invitation.guests.map((guest) => {
            const hasResponse = guest.status !== "PENDING" || guest.respondedAt !== null;
            return (
              <article className="admin-guest-card" key={guest.id}>
                <div className="admin-guest-summary">
                  <div><h3>{guest.name}</h3><p>{responseDate(guest.respondedAt)}</p></div>
                  <StatusBadge status={guest.status} requiresRsvp={guest.requiresRsvp} />
                </div>
                <details className="admin-edit-disclosure"><summary>Editar dados</summary><GuestForm invitationId={invitation.id} guest={guest} /></details>
                <div className="admin-guest-delete"><ConfirmDeleteButton id={guest.id} kind="guest" label="Remover convidado" title={`Remover ${guest.name}?`} description={hasResponse ? "Esta pessoa já respondeu. O status e todas as informações da resposta serão perdidos definitivamente." : "Esta pessoa será removida do convite. Esta ação não pode ser desfeita."} /></div>
              </article>
            );
          })}</div>
        )}
      </section>
    </main>
  );
}
