import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { CopyCodeButton } from "@/components/admin/copy-code-button";
import { PencilIcon, PlusIcon, SearchIcon } from "@/components/ui/icons";
import { adminEyebrow, adminHeading, adminPage, control, editActionButton, field, panel, primaryButton, secondaryButton, textButton } from "@/components/ui/styles";
import { requireAdminPage } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { listInvitations } from "@/services/admin.service";

export const metadata: Metadata = { title: "Convites | Administração" };
const filters = [["ALL", "Todos"], ["CONFIRMED", "Confirmados"], ["DECLINED", "Não irão"], ["PENDING", "Aguardando"]] as const;
const th = "border-b border-border px-3 py-3 text-left align-top text-[0.66rem] tracking-[0.04em] text-muted-foreground uppercase";
const td = "border-b border-border px-3 py-3 align-top";

export default async function InvitationsPage({ searchParams }: PageProps<"/admin/invitations">) {
  await requireAdminPage();
  const params = await searchParams;
  const query = typeof params.query === "string" ? params.query : "";
  const status = typeof params.status === "string" ? params.status : "ALL";
  const invitations = await listInvitations({ query, status }, getDb());
  return (
    <main className={adminPage} id="admin-content">
      <div className="mb-8 flex flex-col items-start gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className={adminEyebrow}>Lista de convidados</p><h1 className={adminHeading}>Convites</h1><p className="mt-2 text-muted-foreground">Busque por convite, código ou nome de convidado.</p></div>
        <Link className={primaryButton} href="/admin/invitations/new"><PlusIcon className="size-5" /> Criar convite</Link>
      </div>

      <form className={`${panel} grid gap-4 p-5 sm:grid-cols-[minmax(0,2fr)_minmax(170px,1fr)_auto_auto] sm:items-end`} method="get" role="search">
        <div className={field}><label htmlFor="invitation-search">Buscar</label><input className={control} id="invitation-search" name="query" defaultValue={query} maxLength={120} placeholder="Nome, convidado ou código" /></div>
        <div className={field}><label htmlFor="status-filter">Status</label><select className={control} id="status-filter" name="status" defaultValue={status}>{filters.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
        <button className={primaryButton} type="submit"><SearchIcon className="size-5" /> Aplicar filtros</button>
      </form>

      {invitations.length === 0 ? (
        <section className={`${panel} mt-5 border-dashed px-5 py-12 text-center`}>
          <h2 className="text-xl font-bold">{query || status !== "ALL" ? "Nenhum convite encontrado" : "Nenhum convite cadastrado"}</h2>
          <p className="mx-auto mt-3 mb-5 max-w-136 text-muted-foreground">{query || status !== "ALL" ? "Ajuste a busca ou limpe os filtros para tentar novamente." : "Crie o primeiro convite para começar a organizar sua lista."}</p>
          <Link className={primaryButton} href="/admin/invitations/new"><PlusIcon className="size-5" /> Criar convite</Link>
        </section>
      ) : (
        <>
          <p className="admin-result-count mt-5 mb-3 text-xs text-muted-foreground" role="status">{invitations.length} {invitations.length === 1 ? "convite encontrado" : "convites encontrados"}</p>
          <div className={`${panel} hidden overflow-x-auto lg:block`}>
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">Convites e totais de RSVP</caption>
              <thead><tr><th className={th} scope="col">Convite</th><th className={th} scope="col">Código</th><th className={th} scope="col">Pessoas</th><th className={th} scope="col">Confirmados</th><th className={th} scope="col">Não irão</th><th className={th} scope="col">Aguardando</th><th className={th} scope="col">Ações</th></tr></thead>
              <tbody>{invitations.map((invitation) => (
                <tr key={invitation.id} className="last:[&>*]:border-b-0">
                  <th className={`${td} min-w-40`} scope="row">{invitation.name}</th><td className={td}><code className="font-bold tracking-[0.08em]">{invitation.code}</code></td><td className={td}>{invitation.guestCount}</td><td className={`${td} font-bold text-emerald-700`}>{invitation.confirmed}</td><td className={`${td} font-bold text-red-700`}>{invitation.declined}</td><td className={`${td} font-bold text-amber-700`}>{invitation.pending}</td>
                  <td className={td}><div className="flex flex-wrap items-center gap-2"><Link className={editActionButton} href={`/admin/invitations/${invitation.id}`} aria-label={`Ver e editar ${invitation.name}`} title="Ver e editar"><PencilIcon className="size-5" /></Link><CopyCodeButton code={invitation.code} iconOnly /><ConfirmDeleteButton id={invitation.id} kind="invitation" label={`Excluir ${invitation.name}`} iconOnly title="Excluir convite?" description="Todos os convidados vinculados também serão removidos. Esta ação não pode ser desfeita." /></div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <div className="grid gap-4 lg:hidden">{invitations.map((invitation) => (
            <article className={`${panel} admin-invitation-card p-5`} key={invitation.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2"><h2 className="text-xl font-bold">{invitation.name}</h2><code className="font-bold tracking-[0.08em]">{invitation.code}</code></div>
              <dl className="my-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-admin-background p-3"><dt className="text-[0.65rem] text-muted-foreground">Pessoas</dt><dd className="mt-1 font-bold tabular-nums">{invitation.guestCount}</dd></div>
                <div className="rounded-lg bg-emerald-50 p-3"><dt className="text-[0.65rem] text-emerald-800">Confirmados</dt><dd className="mt-1 font-bold text-emerald-700 tabular-nums">{invitation.confirmed}</dd></div>
                <div className="rounded-lg bg-red-50 p-3"><dt className="text-[0.65rem] text-red-800">Não irão</dt><dd className="mt-1 font-bold text-red-700 tabular-nums">{invitation.declined}</dd></div>
                <div className="rounded-lg bg-amber-50 p-3"><dt className="text-[0.65rem] text-amber-800">Aguardando</dt><dd className="mt-1 font-bold text-amber-700 tabular-nums">{invitation.pending}</dd></div>
              </dl>
              <div className="flex flex-wrap items-center gap-2"><Link className={`${editActionButton} w-auto gap-2 px-3`} href={`/admin/invitations/${invitation.id}`}><PencilIcon className="size-5" /><span className="text-xs font-bold">Ver e editar</span></Link><CopyCodeButton code={invitation.code} /><ConfirmDeleteButton id={invitation.id} kind="invitation" label="Excluir" title="Excluir convite?" description="Todos os convidados vinculados também serão removidos. Esta ação não pode ser desfeita." /></div>
            </article>
          ))}</div>
        </>
      )}
    </main>
  );
}
