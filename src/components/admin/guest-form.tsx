"use client";

import { useActionState } from "react";
import { createGuestAction, updateGuestAction } from "@/actions/admin.actions";
import { emptyAdminActionState } from "@/types/admin";
import { FieldError, FormStatus, SubmitButton } from "./form-parts";

type GuestValues = {
  id?: string;
  name?: string;
  requiresRsvp?: boolean;
  phone?: string | null;
  dietaryRestriction?: string | null;
  notes?: string | null;
  message?: string | null;
};

export function GuestForm({ invitationId, guest }: { invitationId: string; guest?: GuestValues }) {
  const prefix = guest?.id ?? "new";
  const action = guest?.id ? updateGuestAction.bind(null, guest.id) : createGuestAction.bind(null, invitationId);
  const [state, formAction] = useActionState(action, emptyAdminActionState);
  return (
    <form action={formAction} className="admin-form admin-guest-form">
      <div className="admin-field admin-field-wide">
        <label htmlFor={`${prefix}-guest-name`}>Nome</label>
        <input id={`${prefix}-guest-name`} name="name" defaultValue={guest?.name} required maxLength={120} aria-invalid={!!state.fieldErrors?.name} aria-describedby={state.fieldErrors?.name ? `${prefix}-guest-name-error` : undefined} />
        <FieldError id={`${prefix}-guest-name-error`} errors={state.fieldErrors?.name} />
      </div>
      <div className="admin-field">
        <label htmlFor={`${prefix}-requires-rsvp`}>Precisa responder ao RSVP?</label>
        <select id={`${prefix}-requires-rsvp`} name="requiresRsvp" defaultValue={String(guest?.requiresRsvp ?? true)}>
          <option value="true">Sim</option>
          <option value="false">Não</option>
        </select>
      </div>
      <div className="admin-field">
        <label htmlFor={`${prefix}-phone`}>Telefone <span>(opcional)</span></label>
        <input id={`${prefix}-phone`} name="phone" type="tel" defaultValue={guest?.phone ?? ""} maxLength={40} aria-invalid={!!state.fieldErrors?.phone} aria-describedby={state.fieldErrors?.phone ? `${prefix}-phone-error` : undefined} />
        <FieldError id={`${prefix}-phone-error`} errors={state.fieldErrors?.phone} />
      </div>
      <div className="admin-field admin-field-wide">
        <label htmlFor={`${prefix}-dietary`}>Restrição alimentar <span>(opcional)</span></label>
        <textarea id={`${prefix}-dietary`} name="dietaryRestriction" defaultValue={guest?.dietaryRestriction ?? ""} maxLength={500} rows={2} aria-invalid={!!state.fieldErrors?.dietaryRestriction} aria-describedby={state.fieldErrors?.dietaryRestriction ? `${prefix}-dietary-error` : undefined} />
        <FieldError id={`${prefix}-dietary-error`} errors={state.fieldErrors?.dietaryRestriction} />
      </div>
      <div className="admin-field admin-field-wide">
        <label htmlFor={`${prefix}-notes`}>Observações <span>(opcional)</span></label>
        <textarea id={`${prefix}-notes`} name="notes" defaultValue={guest?.notes ?? ""} maxLength={1000} rows={3} aria-invalid={!!state.fieldErrors?.notes} aria-describedby={state.fieldErrors?.notes ? `${prefix}-notes-error` : undefined} />
        <FieldError id={`${prefix}-notes-error`} errors={state.fieldErrors?.notes} />
      </div>
      <div className="admin-field admin-field-wide">
        <label htmlFor={`${prefix}-message`}>Mensagem aos noivos <span>(opcional)</span></label>
        <textarea id={`${prefix}-message`} name="message" defaultValue={guest?.message ?? ""} maxLength={2000} rows={3} aria-invalid={!!state.fieldErrors?.message} aria-describedby={state.fieldErrors?.message ? `${prefix}-message-error` : undefined} />
        <FieldError id={`${prefix}-message-error`} errors={state.fieldErrors?.message} />
      </div>
      <div className="admin-form-footer admin-field-wide">
        <FormStatus state={state} />
        <SubmitButton pendingLabel={guest ? "Salvando..." : "Adicionando..."}>{guest ? "Salvar convidado" : "Adicionar convidado"}</SubmitButton>
      </div>
    </form>
  );
}
