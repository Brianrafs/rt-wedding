"use client";

import { useFormStatus } from "react-dom";
import { formStatus, primaryButton } from "@/components/ui/styles";

export function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1.5 text-xs font-bold text-danger" id={id}>{errors[0]}</p>;
}

export function SubmitButton({ children, pendingLabel = "Salvando..." }: { children: React.ReactNode; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return <button className={primaryButton} type="submit" disabled={pending}>{pending ? pendingLabel : children}</button>;
}

export function FormStatus({ state }: { state: { status?: "success" | "error"; message?: string } }) {
  if (!state.message) return null;
  return (
    <p className={`${formStatus} ${state.status === "error" ? "border-danger bg-red-50 text-red-950" : "border-emerald-700 bg-emerald-50 text-emerald-950"}`} role={state.status === "error" ? "alert" : "status"}>
      {state.message}
    </p>
  );
}
