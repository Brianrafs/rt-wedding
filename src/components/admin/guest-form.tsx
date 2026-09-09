"use client";

import { useActionState } from "react";
import { createGuestAction, updateGuestAction } from "@/actions/admin.actions";
import { emptyAdminActionState } from "@/types/admin";
import { control, field } from "@/components/ui/styles";
import { FieldError, FormStatus, SubmitButton } from "./form-parts";

type GuestValues = {
  id?: string;
  name?: string;
  requiresRsvp?: boolean;
};

export function GuestForm({ invitationId, guest }: { invitationId: string; guest?: GuestValues }) {
  const prefix = guest?.id ?? "new";
  const action = guest?.id ? updateGuestAction.bind(null, guest.id) : createGuestAction.bind(null, invitationId);
  const [state, formAction] = useActionState(action, emptyAdminActionState);
  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(220px,0.45fr)] sm:items-end">
      <div className={field}>
        <label htmlFor={`${prefix}-guest-name`}>Nome</label>
        <input className={control} id={`${prefix}-guest-name`} name="name" defaultValue={guest?.name} required maxLength={120} aria-invalid={!!state.fieldErrors?.name} aria-describedby={state.fieldErrors?.name ? `${prefix}-guest-name-error` : undefined} />
        <FieldError id={`${prefix}-guest-name-error`} errors={state.fieldErrors?.name} />
      </div>
      <div className={field}>
        <label htmlFor={`${prefix}-requires-rsvp`}>Precisa responder ao RSVP?</label>
        <select className={control} id={`${prefix}-requires-rsvp`} name="requiresRsvp" defaultValue={String(guest?.requiresRsvp ?? true)}>
          <option value="true">Sim</option>
          <option value="false">Não</option>
        </select>
      </div>
      <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <FormStatus state={state} />
        <SubmitButton pendingLabel={guest ? "Salvando..." : "Adicionando..."}>{guest ? "Salvar convidado" : "Adicionar convidado"}</SubmitButton>
      </div>
    </form>
  );
}
