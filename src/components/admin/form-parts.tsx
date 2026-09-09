"use client";

import { useFormStatus } from "react-dom";

export function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="admin-field-error" id={id}>{errors[0]}</p>;
}

export function SubmitButton({ children, pendingLabel = "Salvando..." }: { children: React.ReactNode; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return <button className="admin-primary-button" type="submit" disabled={pending}>{pending ? pendingLabel : children}</button>;
}

export function FormStatus({ state }: { state: { status?: "success" | "error"; message?: string } }) {
  if (!state.message) return null;
  return (
    <p className={`admin-form-status ${state.status === "error" ? "is-error" : "is-success"}`} role={state.status === "error" ? "alert" : "status"}>
      {state.message}
    </p>
  );
}

