import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { CopyCodeButton } from "@/components/admin/copy-code-button";
import { requireAdminPage } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { listInvitations } from "@/services/admin.service";

export const metadata: Metadata = { title: "Convites | Administração" };

const filters = [
  ["ALL", "Todos"], ["CONFIRMED", "Confirmados"], ["DECLINED", "Não irão"], ["PENDING", "Aguardando"],
] as const;

export default async function InvitationsPage({ searchParams }: PageProps<"/admin/invitations">) {
  await requireAdminPage();
  const params = await searchParams;
  const query = typeof params.query === "string" ? params.query : "";
  const status = typeof params.status === "string" ? params.status : "ALL";
  const invitations = await listInvitations({ query, status }, getDb());
  return (
    <main className="admin-page" id="admin-content">
      <div className="admin-page-heading">
        <div><p className="admin-eyebrow">Lista de convidados</p><h1>Convites</h1><p>Busque por convite, código ou nome de convidado.</p></div>
        <Link className="admin-primary-link" href="/admin/invitations/new">Criar convite</Link>
      </div>

      <form className="admin-filters" method="get" role="search">
        <div className="admin-field"><label htmlFor="invitation-search">Buscar</label><input id="invitation-search" name="query" defaultValue={query} maxLength={120} placeholder="Nome, convidado ou código" /></div>
        <div className="admin-field"><label htmlFor="status-filter">Status</label><select id="status-filter" name="status" defaultValue={status}>{filters.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
        <button className="admin-primary-button" type="submit">Aplicar filtros</button>
        {(query || status !== "ALL") ? <Link className="admin-text-link" href="/admin/invitations">Limpar filtros</Link> : null}
      </form>

      {invitations.length === 0 ? (
        <section className="admin-empty-state">
          <h2>{query || status !== "ALL" ? "Nenhum convite encontrado" : "Nenhum convite cadastrado"}</h2>
          <p>{query || status !== "ALL" ? "Ajuste a busca ou limpe os filtros para tentar novamente." : "Crie o primeiro convite para começar a organizar sua lista."}</p>
          {query || status !== "ALL" ? <Link className="admin-secondary-link" href="/admin/invitations">Limpar filtros</Link> : <Link className="admin-primary-link" href="/admin/invitations/new">Criar convite</Link>}
        </section>
      ) : (
        <>
          <p className="admin-result-count" role="status">{invitations.length} {invitations.length === 1 ? "convite encontrado" : "convites encontrados"}</p>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <caption className="admin-sr-only">Convites e totais de RSVP</caption>
              <thead><tr><th scope="col">Convite</th><th scope="col">Código</th><th scope="col">Pessoas</th><th scope="col">Confirmados</th><th scope="col">Não irão</th><th scope="col">Aguardando</th><th scope="col">Ações</th></tr></thead>
              <tbody>{invitations.map((invitation) => (
                <tr key={invitation.id}>
                  <th scope="row">{invitation.name}</th><td><code>{invitation.code}</code></td><td>{invitation.guestCount}</td><td>{invitation.confirmed}</td><td>{invitation.declined}</td><td>{invitation.pending}</td>
                  <td><div className="admin-row-actions"><Link href={`/admin/invitations/${invitation.id}`}>Ver e editar</Link><CopyCodeButton code={invitation.code} /><ConfirmDeleteButton id={invitation.id} kind="invitation" label="Excluir" title="Excluir convite?" description="Todos os convidados vinculados também serão removidos. Esta ação não pode ser desfeita." /></div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <div className="admin-mobile-list">{invitations.map((invitation) => (
            <article className="admin-invitation-card" key={invitation.id}>
              <div><h2>{invitation.name}</h2><code>{invitation.code}</code></div>
              <dl><div><dt>Pessoas</dt><dd>{invitation.guestCount}</dd></div><div><dt>Confirmados</dt><dd>{invitation.confirmed}</dd></div><div><dt>Não irão</dt><dd>{invitation.declined}</dd></div><div><dt>Aguardando</dt><dd>{invitation.pending}</dd></div></dl>
              <div className="admin-row-actions"><Link href={`/admin/invitations/${invitation.id}`}>Ver e editar</Link><CopyCodeButton code={invitation.code} /><ConfirmDeleteButton id={invitation.id} kind="invitation" label="Excluir" title="Excluir convite?" description="Todos os convidados vinculados também serão removidos. Esta ação não pode ser desfeita." /></div>
            </article>
          ))}</div>
        </>
      )}
    </main>
  );
}
