import type { Metadata } from "next";
import { z } from "zod";
import { Countdown } from "@/components/wedding/countdown";
import { RsvpSection } from "@/components/rsvp/rsvp-section";
import { wedding } from "@/constants/wedding";
import { resolveWeddingDate } from "@/lib/wedding-date";

export function generateMetadata(): Metadata {
  const siteUrl = z.url({ protocol: /^https?$/ }).optional()
    .safeParse(process.env.NEXT_PUBLIC_SITE_URL || undefined);
  if (!siteUrl.success) throw new Error("Invalid NEXT_PUBLIC_SITE_URL configuration.");
  const title = `${wedding.groom} & ${wedding.bride} | ${wedding.dateLabel}`;
  const description = "Vamos celebrar o nosso sim. Encontre aqui os detalhes do casamento de Ryelthon e Thayna, em 10 de dezembro de 2026.";
  return {
    title,
    description,
    ...(siteUrl.data ? { metadataBase: new URL(siteUrl.data), alternates: { canonical: "/" } } : {}),
    openGraph: { title, description, locale: "pt_BR", type: "website", siteName: "Ryelthon & Thayna" },
    twitter: { card: "summary", title, description },
  };
}

function PhotoPlaceholder({ className = "" }: { className?: string }) {
  return (
    <figure className={`photo-placeholder ${className}`}>
      <div className="photo-placeholder-inner">
        <span className="eyebrow">Um novo capítulo</span>
        <span className="placeholder-date" aria-hidden="true">10 / 12</span>
      </div>
      <figcaption>Nossos registros, em breve.</figcaption>
    </figure>
  );
}

export default function Home() {
  const event = resolveWeddingDate(process.env.WEDDING_DATE);
  return (
    <>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <header className="site-header page-width">
        <a className="header-home" href="#inicio" aria-label="Ryelthon e Thayna, início">Ryelthon <span>&</span> Thayna</a>
        <nav aria-label="Navegação principal">
          <a href="#nosso-dia">Nosso dia</a>
          <a href="#local">Local</a>
          <a href="#traje">Traje</a>
          <a href="#rsvp">Confirmação</a>
        </nav>
      </header>

      <main id="conteudo" tabIndex={-1}>
        <section className="hero page-width" id="inicio" aria-labelledby="couple-names">
          <div className="hero-copy">
            <p className="eyebrow">O nosso casamento</p>
            <h1 id="couple-names"><span>{wedding.groom}</span><span className="ampersand">&</span><span>{wedding.bride}</span></h1>
            <p className="hero-date"><time dateTime={wedding.date}>10 <span>·</span> 12 <span>·</span> 2026</time></p>
            <p className="hero-message">O começo de uma vida.<br />A alegria de celebrar com você.</p>
            <a className="text-link" href="#nosso-dia">Conheça nosso dia <span aria-hidden="true">↓</span></a>
          </div>
          <PhotoPlaceholder className="hero-photo" />
          <p className="hero-footnote">Com amor, para as pessoas que fazem parte da nossa história.</p>
        </section>

        <section className="countdown-section section-space" aria-labelledby="countdown-heading">
          <div className="page-width centered">
            <p className="eyebrow">Cada dia mais perto</p>
            <h2 id="countdown-heading">Até o nosso sim</h2>
            <p className="section-intro">{event.hasCeremonyTime ? "Contando os instantes para celebrar juntos." : "Contando os instantes até o início do nosso dia."}</p>
            <Countdown datetime={event.datetime} />
          </div>
        </section>

        <section className="details-section page-width section-space" id="nosso-dia" aria-labelledby="day-heading">
          <div className="section-heading">
            <p className="eyebrow">Reserve essa data</p>
            <h2 id="day-heading">Nosso dia</h2>
          </div>
          <div className="details-layout">
            <div className="date-panel">
              <time dateTime={wedding.date}><span className="date-day">10</span><span className="date-month">Dezembro</span><span className="date-year">2026</span></time>
              <p>Quinta-feira</p>
            </div>
            <div className="details-copy">
              <p className="large-copy">Temos um encontro<br />para celebrar o amor.</p>
              <p>Estamos preparando cada detalhe com carinho. Será ainda mais especial ter você ao nosso lado.</p>
              <dl className="event-facts">
                <div><dt>Cerimônia</dt><dd>{event.timeLabel}{event.hasCeremonyTime && <small>Horário de Fortaleza</small>}</dd></div>
                <div><dt>Onde vamos celebrar</dt><dd>{wedding.venue.name || "Local em breve"}</dd></div>
              </dl>
            </div>
          </div>
        </section>

        <section className="venue-section section-space" id="local" aria-labelledby="venue-heading">
          <div className="page-width venue-layout">
            <div className="venue-placeholder" aria-hidden="true"><span>O cenário<br /><i>do nosso sim.</i></span></div>
            <div className="venue-copy">
              <p className="eyebrow">Aqui, uma nova história</p>
              <h2 id="venue-heading">O local</h2>
              <p className="large-copy">{wedding.venue.name || "Um lugar para guardar na memória."}</p>
              <p>{wedding.venue.address || "Em breve, compartilharemos o endereço e todas as orientações para chegar e celebrar com a gente."}</p>
              {wedding.venue.mapUrl ? <a className="text-link" href={wedding.venue.mapUrl} target="_blank" rel="noreferrer">Como chegar <span aria-hidden="true">↗</span><span className="sr-only"> (abre em outra aba)</span></a> : <p className="pending-label">Localização em breve</p>}
            </div>
          </div>
        </section>

        <section className="dress-section page-width section-space centered" id="traje" aria-labelledby="dress-heading">
          <p className="eyebrow">Para viver esse momento</p>
          <h2 id="dress-heading">Com leveza,<br /><i>com você.</i></h2>
          <p className="section-intro">Queremos que você se sinta à vontade para celebrar, abraçar e criar boas lembranças.</p>
          <div className="dress-note"><h3>Traje</h3><p>{wedding.dressCode || "Em breve, os detalhes do traje para o nosso dia."}</p></div>
        </section>

        <section className="memories-section page-width" aria-labelledby="memories-heading">
          <div className="memories-copy"><p className="eyebrow">O que fica é o amor</p><h2 id="memories-heading">Instantes que<br /><i>ficam com a gente.</i></h2><p>Logo, um pouco de nós por aqui.</p></div>
          <PhotoPlaceholder className="memories-photo" />
        </section>

        <RsvpSection />
      </main>

      <footer className="site-footer centered">
        <p className="eyebrow">Com amor</p>
        <p className="footer-names">{wedding.groom} <span>&</span> {wedding.bride}</p>
        <time dateTime={wedding.date}>{wedding.dateLabel}</time>
        <a href="#inicio" className="footer-top">Voltar ao início <span aria-hidden="true">↑</span></a>
      </footer>
    </>
  );
}
