"use client";

import { useActionState, useRef, useState } from "react";
import { createInvitationAction } from "@/actions/admin.actions";
import { emptyAdminActionState } from "@/types/admin";
import { PlusIcon, TrashIcon } from "@/components/ui/icons";
import { control, field, panel, secondaryButton, textButton } from "@/components/ui/styles";
import { FieldError, FormStatus, SubmitButton } from "./form-parts";

type GuestRow = { key: number };

export function InvitationCreateForm() {
  const [state, action] = useActionState(createInvitationAction, emptyAdminActionState);
  const [guests, setGuests] = useState<GuestRow[]>([{ key: 0 }]);
  const nextKey = useRef(1);

  return (
    <form action={action} className={`${panel} grid gap-4 p-5`}>
      <div className={field}>
        <label htmlFor="invitation-name">Nome do convite</label>
        <input className={control} id="invitation-name" name="name" required maxLength={120} aria-invalid={!!state.fieldErrors?.name} aria-describedby={state.fieldErrors?.name ? "invitation-name-error" : undefined} />
        <p className="mt-1.5 text-[0.68rem] text-muted-foreground">Exemplo: Família Silva</p>
        <FieldError id="invitation-name-error" errors={state.fieldErrors?.name} />
      </div>

      <fieldset className="min-w-0 border-0 p-0">
        <legend>Convidados iniciais</legend>
        <p className="mt-1.5 text-[0.68rem] text-muted-foreground">O convite e estas pessoas serão cadastrados juntos.</p>
        <FieldError id="invitation-guests-error" errors={state.fieldErrors?.guests} />
        <div className="my-4 grid gap-4">
          {guests.map((guest, index) => (
            <div className="grid gap-3 rounded-[10px] border border-border bg-admin-background p-4 sm:grid-cols-[minmax(0,2fr)_minmax(180px,1fr)_auto] sm:items-end" key={guest.key}>
              <div className={field}>
                <label htmlFor={`guest-name-${guest.key}`}>Nome do convidado {index + 1}</label>
                <input className={control} id={`guest-name-${guest.key}`} name="guestName" required maxLength={120} />
              </div>
              <div className={field}>
                <label htmlFor={`guest-rsvp-${guest.key}`}>Precisa confirmar presença?</label>
                <select className={control} id={`guest-rsvp-${guest.key}`} name="guestRequiresRsvp" defaultValue="true">
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </select>
              </div>
              {guests.length > 1 ? (
                <button className={`${textButton} text-danger`} type="button" onClick={() => setGuests((rows) => rows.filter((row) => row.key !== guest.key))}>
                  <TrashIcon className="size-5" /> Remover pessoa
                </button>
              ) : null}
            </div>
          ))}
        </div>
        <button className={secondaryButton} type="button" onClick={() => setGuests((rows) => [...rows, { key: nextKey.current++ }])}>
          <PlusIcon className="size-5" /> Adicionar outra pessoa
        </button>
      </fieldset>

      <FormStatus state={state} />
      <SubmitButton pendingLabel="Criando convite...">Criar convite</SubmitButton>
    </form>
  );
}
