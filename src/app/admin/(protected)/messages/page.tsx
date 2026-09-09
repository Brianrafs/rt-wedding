import type { Metadata } from "next";
import Link from "next/link";
import { MailIcon } from "@/components/ui/icons";
import { adminEyebrow, adminHeading, adminPage, panel, secondaryButton } from "@/components/ui/styles";
import { requireAdminPage } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { listGuestMessages } from "@/services/admin.service";

export const metadata: Metadata = { title: "Mensagens dos convidados | Ryelthon & Thayna" };

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export default async function GuestMessagesPage() {
  await requireAdminPage();
  const messages = await listGuestMessages(getDb());

  return (
    <main className={adminPage} id="admin-content">
      <div className="mb-8">
        <p className={adminEyebrow}>Carinho dos convidados</p>
        <div className="mt-1 flex items-center gap-3">
          <MailIcon className="size-8 text-primary-hover" />
          <h1 className={adminHeading}>Mensagens aos noivos</h1>
        </div>
        <p className="mt-2 text-muted-foreground">Leia as mensagens enviadas junto às confirmações de presença.</p>
      </div>

      {messages.length === 0 ? (
        <section className={`${panel} p-8 text-center`} aria-labelledby="empty-messages-title">
          <MailIcon className="mx-auto size-10 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-bold" id="empty-messages-title">Nenhuma mensagem recebida ainda</h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">Quando um convidado deixar uma mensagem na confirmação, ela aparecerá aqui.</p>
        </section>
      ) : (
        <section aria-labelledby="messages-list-title">
          <h2 className="sr-only" id="messages-list-title">Mensagens recebidas</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {messages.map((guest) => (
              <article className={`${panel} flex flex-col p-6`} key={guest.id}>
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border pb-4">
                  <div>
                    <h2 className="text-lg font-bold">{guest.name}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">Convite: {guest.invitation.name}</p>
                  </div>
                  {guest.respondedAt && <time className="text-xs text-muted-foreground" dateTime={guest.respondedAt.toISOString()}>{dateFormatter.format(guest.respondedAt)}</time>}
                </div>
                <blockquote className="my-6 flex-1 whitespace-pre-wrap border-l-4 border-soft-lilac pl-4 leading-relaxed">{guest.message}</blockquote>
                <Link className={`${secondaryButton} self-start`} href={`/admin/invitations/${guest.invitation.id}`}>
                  Ver convite {guest.invitation.code}
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
