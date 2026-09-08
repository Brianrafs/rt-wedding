"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  lookupInvitationAction,
  rsvpAvailabilityAction,
  submitRsvpAction,
} from "@/actions/rsvp.actions";
import type { PublicInvitation, RsvpStatus } from "@/types/rsvp";

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

export function RsvpSection() {
  const [availability, setAvailability] = useState<"loading" | "open" | "closed" | "unavailable">("loading");
  const [deadlineLabel, setDeadlineLabel] = useState("");
  const [code, setCode] = useState("");
  const [invitation, setInvitation] = useState<PublicInvitation | null>(null);
  const [drafts, setDrafts] = useState<GuestDraft[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
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
    setCode(code.trim().toUpperCase());
    setInvitation(result.data);
    setDrafts(draftsFromInvitation(result.data));
    setSaved(false);
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
    setInvitation(null);
    setDrafts([]);
    setCode("");
    setError("");
    setSaved(false);
  }

  if (availability === "loading") {
    return <RsvpShell><h2 id="rsvp-heading">Confirme sua presença</h2><p className="section-intro" role="status">Preparando as confirmações...</p></RsvpShell>;
  }

  if (availability !== "open") {
    return (
      <RsvpShell>
        <h2 id="rsvp-heading">As confirmações estão indisponíveis</h2>
        <p className="section-intro">{error}</p>
      </RsvpShell>
    );
  }

  if (saved && invitation) {
    const hasConfirmedGuest = invitation.guests.some((guest) => guest.status === "CONFIRMED");
    return (
      <RsvpShell>
        <p className="eyebrow">Resposta recebida</p>
        <h2 ref={resultHeadingRef} tabIndex={-1} id="rsvp-heading">
          {hasConfirmedGuest ? "Que alegria ter vocês conosco." : "Obrigado por nos avisar."}
        </h2>
        <p className="section-intro">
          {hasConfirmedGuest
            ? "Guardamos suas respostas com carinho. Nos vemos no nosso grande dia."
            : "Sentiremos a falta de vocês, mas ficamos felizes por fazerem parte da nossa história."}
        </p>
        <div className="rsvp-actions">
          <button className="secondary-button" type="button" onClick={() => setSaved(false)}>Alterar respostas</button>
          <button className="text-button" type="button" onClick={startOver}>Consultar outro convite</button>
        </div>
      </RsvpShell>
    );
  }

  if (invitation) {
    return (
      <RsvpShell>
        <p className="eyebrow">Convite encontrado</p>
        <h2 ref={resultHeadingRef} tabIndex={-1} id="rsvp-heading">{invitation.name}</h2>
        <p className="section-intro">Conte para nós quem poderá celebrar esse dia conosco.</p>

        {drafts.length > 0 ? (
          <form className="rsvp-response-form" onSubmit={handleSubmit} aria-labelledby="rsvp-heading" aria-describedby={error ? "rsvp-error" : undefined}>
            {invitation.guests.map((guest) => {
              if (!guest.requiresRsvp) {
                return <p className="rsvp-noneligible" key={guest.id}><strong>{guest.name}</strong><span>Não precisa responder</span></p>;
              }
              const draft = drafts.find((item) => item.guestId === guest.id)!;
              return (
                <fieldset className="rsvp-guest" key={guest.id}>
                  <legend>{guest.name}</legend>
                  <div className="rsvp-options">
                    <label className={draft.status === "CONFIRMED" ? "selected" : ""}>
                      <input required type="radio" name={`status-${guest.id}`} value="CONFIRMED" checked={draft.status === "CONFIRMED"} onChange={() => updateDraft(guest.id, "status", "CONFIRMED")} />
                      <span><strong>Confirmarei presença</strong><small>Estarei com vocês</small></span>
                    </label>
                    <label className={draft.status === "DECLINED" ? "selected" : ""}>
                      <input required type="radio" name={`status-${guest.id}`} value="DECLINED" checked={draft.status === "DECLINED"} onChange={() => updateDraft(guest.id, "status", "DECLINED")} />
                      <span><strong>Não poderei comparecer</strong><small>Com carinho, aviso minha ausência</small></span>
                    </label>
                  </div>
                  <details className="rsvp-optional">
                    <summary>Informações opcionais</summary>
                    <div className="rsvp-fields">
                      <label>Telefone <span>(opcional)</span><input type="tel" autoComplete="tel" maxLength={40} value={draft.phone} onChange={(event) => updateDraft(guest.id, "phone", event.target.value)} /></label>
                      <label>Restrição alimentar <span>(opcional)</span><textarea maxLength={500} rows={2} value={draft.dietaryRestriction} onChange={(event) => updateDraft(guest.id, "dietaryRestriction", event.target.value)} /></label>
                      <label>Observações <span>(opcional)</span><textarea maxLength={1000} rows={2} value={draft.notes} onChange={(event) => updateDraft(guest.id, "notes", event.target.value)} /></label>
                      <label>Mensagem aos noivos <span>(opcional)</span><textarea maxLength={2000} rows={3} value={draft.message} onChange={(event) => updateDraft(guest.id, "message", event.target.value)} /></label>
                    </div>
                  </details>
                </fieldset>
              );
            })}
            {error && <p className="rsvp-error" id="rsvp-error" role="alert">{error}</p>}
            <button className="primary-button" disabled={busy} type="submit" aria-live="polite">{busy ? "Salvando respostas..." : "Confirmar respostas"}</button>
            <button className="text-button" disabled={busy} type="button" onClick={startOver}>Consultar outro convite</button>
          </form>
        ) : (
          <div className="rsvp-empty">
            <p>Ninguém deste convite precisa enviar uma confirmação.</p>
            <button className="text-button" type="button" onClick={startOver}>Consultar outro convite</button>
          </div>
        )}
      </RsvpShell>
    );
  }

  return (
    <RsvpShell>
      <p className="eyebrow">Vai ser especial ter você aqui</p>
      <h2 id="rsvp-heading">Confirme sua presença</h2>
      <p className="section-intro">Digite o código recebido no seu convite.</p>
      <form className="rsvp-code-form" onSubmit={handleLookup} aria-labelledby="rsvp-heading">
        <label htmlFor="invitation-code">Código do convite</label>
        <input
          id="invitation-code"
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
        <p id="rsvp-code-help" className="field-help">Prazo para responder: {deadlineLabel}.</p>
        {error && <p className="rsvp-error" id="rsvp-code-error" role="alert">{error}</p>}
        <button className="primary-button" disabled={busy} type="submit" aria-live="polite">{busy ? "Buscando seu convite..." : "Confirmar convite"}</button>
      </form>
    </RsvpShell>
  );
}

function RsvpShell({ children }: { children: React.ReactNode }) {
  return <section className="rsvp-section section-space" id="rsvp" aria-labelledby="rsvp-heading"><div className="page-width">{children}</div></section>;
}
