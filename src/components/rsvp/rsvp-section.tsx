"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  lookupInvitationAction,
  rsvpAvailabilityAction,
  submitRsvpAction,
} from "@/actions/rsvp.actions";
import type { PublicInvitation, RsvpStatus } from "@/types/rsvp";
import { RotateIcon } from "@/components/ui/icons";
import { eyebrow, pageWidth, primaryButton, publicHeading, secondaryButton, sectionIntro, sectionSpace, textButton } from "@/components/ui/styles";

const labelClass = "block text-xs font-bold tracking-[0.04em]";
const inputClass = "mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground outline-none focus:border-primary-hover focus:ring-2 focus:ring-primary-hover/35";

type GuestDraft = {
  guestId: string;
  status: Exclude<RsvpStatus, "PENDING"> | "";
  phone: string;
  dietaryRestriction: string;
  notes: string;
  message: string;
};

const networkError = "Não foi possível conectar agora. Suas alterações continuam na tela; tente novamente.";

function draftsFromInvitation(invitation: PublicInvitation): GuestDraft[] {
  return invitation.guests.filter((guest) => guest.requiresRsvp).map((guest) => ({
    guestId: guest.id,
    status: guest.status === "PENDING" ? "" : guest.status,
    phone: guest.phone ?? "",
    dietaryRestriction: guest.dietaryRestriction ?? "",
    notes: guest.notes ?? "",
    message: guest.message ?? "",
  }));
}

export function RsvpSection({ initialCode }: { initialCode?: string }) {
  const router = useRouter();
  const isDedicatedPage = initialCode !== undefined;
  const [availability, setAvailability] = useState<"loading" | "open" | "closed" | "unavailable">("loading");
  const [deadlineLabel, setDeadlineLabel] = useState("");
  const [code, setCode] = useState(() => initialCode?.trim().toUpperCase() ?? "");
  const [invitation, setInvitation] = useState<PublicInvitation | null>(null);
  const [drafts, setDrafts] = useState<GuestDraft[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [routeLookupComplete, setRouteLookupComplete] = useState(!isDedicatedPage);
  const routeLookupStarted = useRef(false);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let active = true;
    void rsvpAvailabilityAction()
      .then((result) => {
        if (!active) return;
        if (result.ok) {
          setDeadlineLabel(result.data.deadlineLabel);
          setAvailability("open");
        } else {
          setError(result.message);
          setAvailability(result.code === "CLOSED" ? "closed" : "unavailable");
        }
      })
      .catch(() => {
        if (!active) return;
        setError(networkError);
        setAvailability("unavailable");
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (invitation || saved) resultHeadingRef.current?.focus();
  }, [invitation, saved]);

  useEffect(() => {
    if (!initialCode || availability !== "open" || routeLookupStarted.current) return;
    routeLookupStarted.current = true;
    setBusy(true);
    void lookupInvitationAction({ code: initialCode })
      .then((result) => {
        if (!result.ok) {
          setError(result.message);
          if (result.code === "CLOSED") setAvailability("closed");
          return;
        }
        const normalizedCode = initialCode.trim().toUpperCase();
        setCode(normalizedCode);
        setInvitation(result.data);
        setDrafts(draftsFromInvitation(result.data));
      })
      .catch(() => setError(networkError))
      .finally(() => {
        setBusy(false);
        setRouteLookupComplete(true);
      });
  }, [availability, initialCode]);

  async function handleLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const result = await lookupInvitationAction({ code }).catch(() => null);
    setBusy(false);
    if (!result) {
      setError(networkError);
      return;
    }
    if (!result.ok) {
      setError(result.message);
      if (result.code === "CLOSED") setAvailability("closed");
      return;
    }
    const normalizedCode = code.trim().toUpperCase();
    setCode(normalizedCode);
    router.push(`/rsvp/${encodeURIComponent(normalizedCode)}`);
  }

  function updateDraft(guestId: string, field: keyof Omit<GuestDraft, "guestId">, value: string) {
    setDrafts((current) => current.map((draft) => (
      draft.guestId === guestId ? { ...draft, [field]: value } : draft
    )));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (drafts.some((draft) => !draft.status)) {
      setError("Escolha uma resposta para cada pessoa antes de continuar.");
      return;
    }
    setBusy(true);
    const result = await submitRsvpAction({ code, guests: drafts }).catch(() => null);
    setBusy(false);
    if (!result) {
      setError(networkError);
      return;
    }
    if (!result.ok) {
      setError(result.message);
      if (result.code === "CLOSED") setAvailability("closed");
      return;
    }
    setInvitation(result.data);
    setDrafts(draftsFromInvitation(result.data));
    setSaved(true);
  }

  function startOver() {
    if (isDedicatedPage) {
      router.push("/#rsvp");
      return;
    }
    setInvitation(null);
    setDrafts([]);
    setCode("");
    setError("");
    setSaved(false);
  }

  if (availability === "loading") {
    return <RsvpShell><h2 className={publicHeading} id="rsvp-heading">Confirme sua presença</h2><p className={sectionIntro} role="status">Preparando as confirmações...</p></RsvpShell>;
  }

  if (availability !== "open") {
    return (
      <RsvpShell>
        <h2 className={publicHeading} id="rsvp-heading">As confirmações estão indisponíveis</h2>
        <p className={sectionIntro}>{error}</p>
      </RsvpShell>
    );
  }

  if (isDedicatedPage && !routeLookupComplete) {
    return (
      <RsvpShell>
        <h2 className={publicHeading} id="rsvp-heading">Buscando seu convite</h2>
        <p className={sectionIntro} role="status">Só um instante enquanto preparamos sua confirmação...</p>
      </RsvpShell>
    );
  }

  if (isDedicatedPage && routeLookupComplete && !invitation) {
    return (
      <RsvpShell>
        <h2 className={publicHeading} id="rsvp-heading">Não encontramos esse convite</h2>
        <p className={sectionIntro} role="alert">{error || "Confira o código recebido e tente novamente."}</p>
        <Link className={`${secondaryButton} mt-8`} href="/#rsvp">Digitar outro código</Link>
      </RsvpShell>
    );
  }

  if (saved && invitation) {
    const hasConfirmedGuest = invitation.guests.some((guest) => guest.status === "CONFIRMED");
    return (
      <RsvpShell>
        <p className={eyebrow}>Resposta recebida</p>
        <h2 className={publicHeading} ref={resultHeadingRef} tabIndex={-1} id="rsvp-heading">
          {hasConfirmedGuest ? "Que alegria ter vocês conosco." : "Obrigado por nos avisar."}
        </h2>
        <p className={sectionIntro}>
          {hasConfirmedGuest
            ? "Guardamos suas respostas com carinho. Nos vemos no nosso grande dia."
            : "Sentiremos a falta de vocês, mas ficamos felizes por fazerem parte da nossa história."}
        </p>
        <div className="mt-8 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
          <button className={secondaryButton} type="button" onClick={() => setSaved(false)}>Alterar respostas</button>
        </div>
      </RsvpShell>
    );
  }

  if (invitation) {
    return (
      <RsvpShell>
        <p className={eyebrow}>Convite encontrado</p>
        <h2 className={publicHeading} ref={resultHeadingRef} tabIndex={-1} id="rsvp-heading">{invitation.name}</h2>
        <p className={sectionIntro}>Conte para nós quem poderá celebrar esse dia conosco.</p>

        {drafts.length > 0 ? (
          <form className="mt-12 text-left" onSubmit={handleSubmit} aria-labelledby="rsvp-heading" aria-describedby={error ? "rsvp-error" : undefined}>
            {invitation.guests.map((guest) => {
              if (!guest.requiresRsvp) {
                const inheritedLabel = guest.status === "CONFIRMED"
                  ? "Presença confirmada com a família"
                  : guest.status === "DECLINED"
                    ? "Não irá com a família"
                    : "Não precisa responder";
                return <p className="flex flex-wrap justify-between gap-x-4 gap-y-2 border-t border-border py-5 text-left" key={guest.id}><strong>{guest.name}</strong><span className="text-xs text-muted-foreground">{inheritedLabel}</span></p>;
              }
              const draft = drafts.find((item) => item.guestId === guest.id)!;
              return (
                <fieldset className="rsvp-guest border-t border-border py-8" key={guest.id}>
                  <legend className="float-left mb-4 w-full font-display text-[1.65rem] leading-[1.2]">{guest.name}</legend>
                  <div className="clear-both grid gap-3 sm:grid-cols-2">
                    <label className={`relative flex min-h-14 cursor-pointer items-center justify-center rounded-lg border px-5 py-3 text-center transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary-hover ${draft.status === "CONFIRMED" ? "border-primary-hover bg-primary-hover text-white" : "border-border bg-background hover:border-primary-hover hover:bg-soft-lilac/50"}`}>
                      <input className="absolute inset-0 cursor-pointer opacity-0" required type="radio" name={`status-${guest.id}`} value="CONFIRMED" checked={draft.status === "CONFIRMED"} onChange={() => updateDraft(guest.id, "status", "CONFIRMED")} />
                      <span className="pointer-events-none text-sm font-bold">Confirmarei presença</span>
                    </label>
                    <label className={`relative flex min-h-14 cursor-pointer items-center justify-center rounded-lg border px-5 py-3 text-center transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary-hover ${draft.status === "DECLINED" ? "border-primary-hover bg-primary-hover text-white" : "border-border bg-background hover:border-primary-hover hover:bg-soft-lilac/50"}`}>
                      <input className="absolute inset-0 cursor-pointer opacity-0" required type="radio" name={`status-${guest.id}`} value="DECLINED" checked={draft.status === "DECLINED"} onChange={() => updateDraft(guest.id, "status", "DECLINED")} />
                      <span className="pointer-events-none text-sm font-bold">Não poderei comparecer</span>
                    </label>
                  </div>
                  <details className="mt-4">
                    <summary className="min-h-11 w-fit cursor-pointer py-2.5 text-xs underline underline-offset-4">Informações opcionais</summary>
                    <div className="grid gap-4 py-4 sm:grid-cols-2 [&_label]:text-xs [&_label]:font-bold [&_label_span]:text-[0.66rem] [&_label_span]:font-normal [&_label_span]:text-muted-foreground [&_textarea]:resize-y">
                      <label>Telefone <span>(opcional)</span><input className={inputClass} type="tel" autoComplete="tel" maxLength={40} value={draft.phone} onChange={(event) => updateDraft(guest.id, "phone", event.target.value)} /></label>
                      <label>Restrição alimentar <span>(opcional)</span><textarea className={inputClass} maxLength={500} rows={2} value={draft.dietaryRestriction} onChange={(event) => updateDraft(guest.id, "dietaryRestriction", event.target.value)} /></label>
                      <label>Observações <span>(opcional)</span><textarea className={inputClass} maxLength={1000} rows={2} value={draft.notes} onChange={(event) => updateDraft(guest.id, "notes", event.target.value)} /></label>
                      <label>Mensagem aos noivos <span>(opcional)</span><textarea className={inputClass} maxLength={2000} rows={3} value={draft.message} onChange={(event) => updateDraft(guest.id, "message", event.target.value)} /></label>
                    </div>
                  </details>
                </fieldset>
              );
            })}
            {error && <p className="mt-4 border-l-[3px] border-primary-hover bg-background px-4 py-3 text-left text-xs" id="rsvp-error" role="alert">{error}</p>}
            <button className={`${primaryButton} mt-6 w-full`} disabled={busy} type="submit" aria-live="polite">{busy ? "Salvando respostas..." : "Confirmar respostas"}</button>
          </form>
        ) : (
          <div className="mt-8">
            <p>Ninguém deste convite precisa enviar uma confirmação.</p>
          </div>
        )}
      </RsvpShell>
    );
  }

  return (
    <RsvpShell>
      <p className={eyebrow}>Vai ser especial ter você aqui</p>
      <h2 className={publicHeading} id="rsvp-heading">Confirme sua presença</h2>
      <p className={sectionIntro}>Digite o código recebido no seu convite.</p>
      <form className="mx-auto mt-10 max-w-[31rem] text-left" onSubmit={handleLookup} aria-labelledby="rsvp-heading">
        <label className={labelClass} htmlFor="invitation-code">Código do convite</label>
        <input
          id="invitation-code"
          className={`${inputClass} min-h-13.5 px-4 text-base tracking-[0.22em] uppercase`}
          name="code"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          minLength={6}
          maxLength={8}
          required
          value={code}
          onChange={(event) => {
            setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""));
            setError("");
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={`${error ? "rsvp-code-error " : ""}rsvp-code-help`}
        />
        <p id="rsvp-code-help" className="mt-2.5 text-[0.7rem] text-muted-foreground">Prazo para responder: {deadlineLabel}.</p>
        {error && <p className="mt-4 border-l-[3px] border-primary-hover bg-background px-4 py-3 text-left text-xs" id="rsvp-code-error" role="alert">{error}</p>}
        <button className={`${primaryButton} mt-6 w-full`} disabled={busy} type="submit" aria-live="polite">{busy ? "Buscando seu convite..." : "Confirmar convite"}</button>
      </form>
    </RsvpShell>
  );
}

function RsvpShell({ children }: { children: React.ReactNode }) {
  return <section className={`bg-soft-lilac text-center ${sectionSpace}`} id="rsvp" aria-labelledby="rsvp-heading"><div className={`${pageWidth} max-w-190`}>{children}</div></section>;
}
