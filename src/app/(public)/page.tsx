import type { Metadata } from "next";
import { z } from "zod";
import { RsvpSection } from "@/components/rsvp/rsvp-section";
import { ArrowDownIcon, ArrowUpIcon, CalendarIcon, ExternalLinkIcon, MapPinIcon } from "@/components/ui/icons";
import { eyebrow, pageWidth, publicHeading, sectionIntro, sectionSpace } from "@/components/ui/styles";
import { Countdown } from "@/components/wedding/countdown";
import { wedding } from "@/constants/wedding";
import { resolveWeddingDate } from "@/lib/wedding-date";

export function generateMetadata(): Metadata {
  const siteUrl = z.url({ protocol: /^https?$/ }).optional().safeParse(process.env.NEXT_PUBLIC_SITE_URL || undefined);
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
    <figure className={`flex flex-col bg-soft-lilac p-5 ${className}`}>
      <div className="flex flex-1 flex-col items-center justify-between gap-8 border border-b-0 border-border px-3 py-8 text-center">
        <span className={eyebrow}>Um novo capítulo</span>
        <span className="font-display text-[clamp(2.8rem,5vw,4rem)] tracking-[-0.04em] italic" aria-hidden="true">10 / 12</span>
      </div>
      <figcaption className="border border-t-0 border-border px-2 py-8 text-center text-xs">Nossos registros, em breve.</figcaption>
    </figure>
  );
}

export default function Home() {
  const event = resolveWeddingDate(process.env.WEDDING_DATE);
  return (
    <>
      <a className="fixed top-4 left-4 z-50 -translate-y-40 bg-foreground px-4 py-3 text-background focus:translate-y-0" href="#conteudo">Pular para o conteúdo</a>
      <header className={`${pageWidth} flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-b border-border py-5 sm:justify-between`}>
        <a className="py-2 font-display text-lg" href="#inicio" aria-label="Ryelthon e Thayna, início">Ryelthon <span className="mx-1.5 italic">&</span> Thayna</a>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label="Navegação principal">
          {[["#nosso-dia", "Nosso dia"], ["#local", "Local"], ["#traje", "Traje"], ["#rsvp", "Confirmação"]].map(([href, label]) => (
            <a className="inline-flex min-h-11 items-center text-[0.7rem] hover:underline" href={href} key={href}>{label}</a>
          ))}
        </nav>
      </header>

      <main id="conteudo" tabIndex={-1}>
        <section className={`${pageWidth} pt-14 lg:grid lg:grid-cols-2 lg:items-center lg:gap-x-16`} id="inicio" aria-labelledby="couple-names">
          <div className="text-center">
            <p className={eyebrow}>O nosso casamento</p>
            <h1 className="my-7 font-display text-[clamp(3.8rem,12vw,7.8rem)] leading-[0.95] font-normal tracking-[-0.055em] lg:text-[clamp(4.5rem,8.5vw,7.8rem)]" id="couple-names">
              <span className="block">{wedding.groom}</span><span className="my-[0.3em] block font-decoration text-[0.43em] text-primary-hover italic">&</span><span className="block">{wedding.bride}</span>
            </h1>
            <p className="mt-8 text-sm tracking-[0.16em]"><time dateTime={wedding.date}>10 <span className="mx-2">·</span> 12 <span className="mx-2">·</span> 2026</time></p>
            <p className="mt-5 text-base text-muted-foreground">O começo de uma vida.<br />A alegria de celebrar com você.</p>
            <a className="mt-6 inline-flex min-h-12 items-center justify-between gap-8 border-b border-foreground text-xs" href="#nosso-dia">Conheça nosso dia <ArrowDownIcon className="size-5" /></a>
          </div>
          <PhotoPlaceholder className="mt-12 aspect-4/5 sm:mx-auto sm:max-w-[520px] lg:m-0 lg:w-full" />
          <p className="py-6 pb-14 text-center text-[0.625rem] text-muted-foreground lg:col-span-2 lg:pb-12">Com amor, para as pessoas que fazem parte da nossa história.</p>
        </section>

        <section className={`bg-soft-lilac ${sectionSpace}`} aria-labelledby="countdown-heading">
          <div className={`${pageWidth} text-center`}>
            <p className={eyebrow}>Cada dia mais perto</p>
            <h2 className={publicHeading} id="countdown-heading">Até o nosso sim</h2>
            <p className={sectionIntro}>{event.hasCeremonyTime ? "Contando os instantes para celebrar juntos." : "Contando os instantes até o início do nosso dia."}</p>
            <Countdown datetime={event.datetime} />
          </div>
        </section>

        <section className={`${pageWidth} ${sectionSpace}`} id="nosso-dia" aria-labelledby="day-heading">
          <div className="text-center"><p className={eyebrow}>Reserve essa data</p><h2 className={publicHeading} id="day-heading">Nosso dia</h2></div>
          <div className="mt-12 lg:grid lg:grid-cols-[1fr_1.25fr] lg:items-center lg:gap-20">
            <div className="border-b border-border px-4 pt-8 pb-12 text-center lg:border-r lg:border-b-0 lg:py-8">
              <CalendarIcon className="mx-auto mb-4 size-7 text-primary-hover" />
              <time className="flex flex-col" dateTime={wedding.date}><span className="font-display text-[7.5rem] leading-none tracking-[-0.06em]">10</span><span className="mt-4 text-xs tracking-[0.24em] uppercase">Dezembro</span><span className="my-1 font-display text-2xl">2026</span></time>
              <p className="text-xs text-muted-foreground">Quinta-feira</p>
            </div>
            <div className="pt-12 lg:py-4">
              <p className="font-display text-[clamp(2rem,3.5vw,3rem)] leading-[1.2] tracking-[-0.035em]">Temos um encontro<br />para celebrar o amor.</p>
              <p className="mt-6 max-w-[29rem]">Estamos preparando cada detalhe com carinho. Será ainda mais especial ter você ao nosso lado.</p>
              <dl className="mt-8">
                <div className="border-t border-border py-4"><dt className="text-[0.625rem] tracking-[0.12em] uppercase">Cerimônia</dt><dd className="mt-1 text-sm">{event.timeLabel}{event.hasCeremonyTime && <small className="block text-muted-foreground">Horário de Fortaleza</small>}</dd></div>
                <div className="border-t border-border py-4"><dt className="text-[0.625rem] tracking-[0.12em] uppercase">Onde vamos celebrar</dt><dd className="mt-1 text-sm">{wedding.venue.name || "Local em breve"}</dd></div>
              </dl>
            </div>
          </div>
        </section>

        <section className={`bg-soft-lilac ${sectionSpace}`} id="local" aria-labelledby="venue-heading">
          <div className={`${pageWidth} lg:grid lg:grid-cols-2 lg:items-center lg:gap-24`}>
            <div className="grid min-h-80 place-items-center border border-border p-8 text-center lg:min-h-110" aria-hidden="true"><span className="font-display text-[clamp(2.5rem,4vw,4rem)] leading-[1.2] tracking-[-0.04em]">O cenário<br /><i>do nosso sim.</i></span></div>
            <div className="pt-12 lg:p-0">
              <p className={eyebrow}>Aqui, uma nova história</p><h2 className={publicHeading} id="venue-heading">O local</h2>
              <p className="mt-6 max-w-[23rem] font-display text-[1.65rem] leading-[1.2] tracking-[-0.035em]">{wedding.venue.name || "Um lugar para guardar na memória."}</p>
              <p className="mt-6 max-w-[29rem]">{wedding.venue.address || "Em breve, compartilharemos o endereço e todas as orientações para chegar e celebrar com a gente."}</p>
              {wedding.venue.mapUrl ? <a className="mt-6 inline-flex min-h-12 items-center justify-between gap-3 border-b border-foreground text-xs" href={wedding.venue.mapUrl} target="_blank" rel="noreferrer"><MapPinIcon className="size-6 text-primary-hover" /> Como chegar <ExternalLinkIcon className="size-5" /><span className="sr-only"> (abre em outra aba)</span></a> : <p className="mt-6 inline-flex items-center gap-2 border-b border-border py-2.5 text-xs"><MapPinIcon className="size-6 text-primary-hover" /> Localização em breve</p>}
            </div>
          </div>
        </section>

        <section className={`${pageWidth} ${sectionSpace} max-w-[800px] text-center`} id="traje" aria-labelledby="dress-heading">
          <p className={eyebrow}>Para viver esse momento</p><h2 className={publicHeading} id="dress-heading">Com leveza,<br /><i>com você.</i></h2>
          <p className={sectionIntro}>Queremos que você se sinta à vontade para celebrar, abraçar e criar boas lembranças.</p>
          <div className="mx-auto mt-10 max-w-[30rem] border-t border-border pt-7"><h3 className="text-[0.65rem] tracking-[0.18em] uppercase">Traje</h3><p className="mt-2.5 text-sm text-muted-foreground">{wedding.dressCode || "Em breve, os detalhes do traje para o nosso dia."}</p></div>
        </section>

        <section className={`${pageWidth} pb-22 lg:grid lg:grid-cols-2 lg:items-center lg:gap-20 lg:pb-32`} aria-labelledby="memories-heading">
          <div className="pb-10 lg:p-0"><p className={eyebrow}>O que fica é o amor</p><h2 className="mt-4 font-display text-[clamp(2.5rem,4vw,3.5rem)] leading-[1.12] tracking-[-0.045em]" id="memories-heading">Instantes que<br /><i>ficam com a gente.</i></h2><p className="mt-6 text-sm text-muted-foreground">Logo, um pouco de nós por aqui.</p></div>
          <PhotoPlaceholder className="aspect-5/4" />
        </section>
        <RsvpSection />
      </main>

      <footer className="bg-primary px-6 pt-18 pb-8 text-center">
        <p className={eyebrow}>Com amor</p><p className="my-5 font-display text-[clamp(1.9rem,4vw,3rem)] tracking-[-0.04em]">{wedding.groom} <span className="italic">&</span> {wedding.bride}</p>
        <time className="text-xs" dateTime={wedding.date}>{wedding.dateLabel}</time>
        <a href="#inicio" className="mx-auto mt-10 flex min-h-11 w-fit items-center gap-2 py-3 text-[0.65rem] hover:underline">Voltar ao início <ArrowUpIcon className="size-5" /></a>
      </footer>
    </>
  );
}
