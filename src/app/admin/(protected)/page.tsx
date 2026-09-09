import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminPage } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getDashboardStats } from "@/services/admin.service";

export const metadata: Metadata = { title: "Resumo administrativo | Ryelthon & Thayna" };

export default async function AdminPage() {
  await requireAdminPage();
  const stats = await getDashboardStats(getDb());
  const cards = [
    { label: "Total convidados", value: stats.totalEligible, detail: "Pessoas que precisam responder" },
    { label: "Confirmados", value: stats.confirmed, detail: "Presenças confirmadas" },
    { label: "Não irão", value: stats.declined, detail: "Respostas negativas" },
    { label: "Aguardando", value: stats.pending, detail: "Respostas pendentes" },
  ];
  return (
    <main className="admin-page" id="admin-content">
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">Administração</p>
          <h1>Resumo dos convidados</h1>
          <p>Acompanhe as respostas individuais ao convite.</p>
        </div>
        <Link className="admin-primary-link" href="/admin/invitations/new">Criar convite</Link>
      </div>
      <section aria-labelledby="dashboard-metrics-title">
        <h2 className="admin-sr-only" id="dashboard-metrics-title">Indicadores de RSVP</h2>
        <div className="admin-metrics">
          {cards.map((card) => (
            <article className="admin-metric-card" key={card.label}>
              <p>{card.label}</p>
              <strong>{card.value}</strong>
              <span>{card.detail}</span>
            </article>
          ))}
        </div>
      </section>
      <section className="admin-dashboard-actions" aria-labelledby="manage-title">
        <div><h2 id="manage-title">Gerenciar lista</h2><p>Cadastre convites, inclua pessoas e consulte suas respostas.</p></div>
        <Link className="admin-secondary-link" href="/admin/invitations">Ver todos os convites</Link>
      </section>
    </main>
  );
}
