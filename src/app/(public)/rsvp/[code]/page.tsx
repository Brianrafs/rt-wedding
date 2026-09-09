import type { Metadata } from "next";
import Link from "next/link";
import { RsvpSection } from "@/components/rsvp/rsvp-section";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { pageWidth } from "@/components/ui/styles";

export const metadata: Metadata = {
  title: "Confirmação de presença | Ryelthon & Thayna",
  description: "Confirme sua presença no casamento de Ryelthon e Thayna.",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function RsvpPage({ params }: PageProps<"/rsvp/[code]">) {
  const { code } = await params;

  return (
    <>
      <header className="border-b border-border bg-background">
        <div className={`${pageWidth} flex min-h-18 items-center justify-between gap-4`}>
          <Link className="font-display text-xl font-semibold" href="/">Ryelthon & Thayna</Link>
          <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-hover" href="/#rsvp">
            Trocar código
          </Link>
        </div>
      </header>
      <main id="conteudo">
        <h1 className="sr-only">Confirmação de presença</h1>
        <RsvpSection initialCode={code} />
      </main>
    </>
  );
}
