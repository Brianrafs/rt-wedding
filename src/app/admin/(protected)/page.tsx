import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminPage } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getDashboardStats } from "@/services/admin.service";
import { ClockIcon, MailIcon, UserCheckIcon, UsersIcon, UserXIcon } from "@/components/ui/icons";
import { adminEyebrow, adminHeading, adminPage, panel, secondaryButton } from "@/components/ui/styles";

export const metadata: Metadata = { title: "Resumo administrativo | Ryelthon & Thayna" };

export default async function AdminPage() {
  await requireAdminPage();
  const stats = await getDashboardStats(getDb());
  const cards = [
    { label: "Total convidados", value: stats.totalEligible, detail: "Pessoas que precisam responder", Icon: UsersIcon, card: "border-violet-200 bg-violet-50/60", accent: "text-violet-700" },
    { label: "Confirmados", value: stats.confirmed, detail: "Presenças confirmadas", Icon: UserCheckIcon, card: "border-emerald-200 bg-emerald-50/70", accent: "text-emerald-700" },
    { label: "Não irão", value: stats.declined, detail: "Respostas negativas", Icon: UserXIcon, card: "border-red-200 bg-red-50/70", accent: "text-red-700" },
    { label: "Aguardando", value: stats.pending, detail: "Respostas pendentes", Icon: ClockIcon, card: "border-amber-200 bg-amber-50/80", accent: "text-amber-700" },
  ];
  return (
    <main className={adminPage} id="admin-content">
      <div className="mb-8 flex flex-col items-start gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={adminEyebrow}>Administração</p>
          <h1 className={adminHeading}>Resumo dos convidados</h1>
          <p className="mt-2 text-muted-foreground">Acompanhe as respostas individuais ao convite.</p>
        </div>
      </div>
      <section aria-labelledby="dashboard-metrics-title">
        <h2 className="sr-only" id="dashboard-metrics-title">Indicadores de RSVP</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <article className={`rounded-xl border p-5 ${card.card}`} key={card.label}>
              <div className="flex items-center justify-between"><p className="text-xs font-bold text-muted-foreground">{card.label}</p><card.Icon className={`size-7 ${card.accent}`} /></div>
              <strong className={`mt-2 block text-4xl leading-none tabular-nums ${card.accent}`}>{card.value}</strong>
              <span className="mt-2.5 block text-[0.68rem] text-muted-foreground">{card.detail}</span>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
