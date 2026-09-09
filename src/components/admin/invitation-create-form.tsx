"use client";

import { useActionState, useRef, useState } from "react";
import { createInvitationAction } from "@/actions/admin.actions";
import { emptyAdminActionState } from "@/types/admin";
import { FieldError, FormStatus, SubmitButton } from "./form-parts";

type GuestRow = { key: number };

export function InvitationCreateForm() {
  const [state, action] = useActionState(createInvitationAction, emptyAdminActionState);
  const [guests, setGuests] = useState<GuestRow[]>([{ key: 0 }]);
  const nextKey = useRef(1);

  return (
    <form action={action} className="admin-form admin-create-form">
      <div className="admin-field">
        <label htmlFor="invitation-name">Nome do convite</label>
        <input id="invitation-name" name="name" required maxLength={120} aria-invalid={!!state.fieldErrors?.name} aria-describedby={state.fieldErrors?.name ? "invitation-name-error" : undefined} />
        <p className="admin-field-help">Exemplo: Família Silva</p>
        <FieldError id="invitation-name-error" errors={state.fieldErrors?.name} />
      </div>

      <fieldset className="admin-guests-fieldset">
        <legend>Convidados iniciais</legend>
        <p className="admin-field-help">O convite e estas pessoas serão cadastrados juntos.</p>
        <FieldError id="invitation-guests-error" errors={state.fieldErrors?.guests} />
        <div className="admin-initial-guests">
          {guests.map((guest, index) => (
            <div className="admin-initial-guest" key={guest.key}>
              <div className="admin-field">
                <label htmlFor={`guest-name-${guest.key}`}>Nome do convidado {index + 1}</label>
                <input id={`guest-name-${guest.key}`} name="guestName" required maxLength={120} />
              </div>
              <div className="admin-field">
                <label htmlFor={`guest-rsvp-${guest.key}`}>Precisa responder ao RSVP?</label>
                <select id={`guest-rsvp-${guest.key}`} name="guestRequiresRsvp" defaultValue="true">
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </select>
              </div>
              {guests.length > 1 ? (
                <button className="admin-text-button is-danger" type="button" onClick={() => setGuests((rows) => rows.filter((row) => row.key !== guest.key))}>
                  Remover pessoa
                </button>
              ) : null}
            </div>
          ))}
        </div>
        <button className="admin-secondary-button" type="button" onClick={() => setGuests((rows) => [...rows, { key: nextKey.current++ }])}>
          Adicionar outra pessoa
        </button>
      </fieldset>

      <FormStatus state={state} />
      <SubmitButton pendingLabel="Criando convite...">Criar convite</SubmitButton>
    </form>
  );
}

