"use client";

import { useActionState } from "react";
import { updateInvitationAction } from "@/actions/admin.actions";
import { emptyAdminActionState } from "@/types/admin";
import { control, field } from "@/components/ui/styles";
import { FieldError, FormStatus, SubmitButton } from "./form-parts";

export function InvitationEditForm({ id, name }: { id: string; name: string }) {
  const action = updateInvitationAction.bind(null, id);
  const [state, formAction] = useActionState(action, emptyAdminActionState);
  return (
    <form action={formAction} className="grid max-w-155 gap-4">
      <div className={field}>
        <label htmlFor="edit-invitation-name">Nome do convite</label>
        <input className={control} id="edit-invitation-name" name="name" defaultValue={name} required maxLength={120} aria-invalid={!!state.fieldErrors?.name} aria-describedby={state.fieldErrors?.name ? "edit-invitation-name-error" : undefined} />
        <FieldError id="edit-invitation-name-error" errors={state.fieldErrors?.name} />
      </div>
      <FormStatus state={state} />
      <SubmitButton>Salvar nome</SubmitButton>
    </form>
  );
}
