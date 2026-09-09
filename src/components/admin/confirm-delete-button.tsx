"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteGuestAction, deleteInvitationAction } from "@/actions/admin.actions";
import { TrashIcon } from "@/components/ui/icons";
import { dangerButton, deleteActionButton, formStatus, secondaryButton } from "@/components/ui/styles";

type Props = {
  id: string;
  kind: "invitation" | "guest";
  label: string;
  title: string;
  description: string;
  iconOnly?: boolean;
};

export function ConfirmDeleteButton({ id, kind, label, title, description, iconOnly = false }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function confirmDelete() {
    setError("");
    startTransition(async () => {
      const result = kind === "invitation" ? await deleteInvitationAction(id) : await deleteGuestAction(id);
      if (result.status === "error") {
        setError(result.message ?? "Não foi possível excluir.");
        return;
      }
      dialog.current?.close();
      if (kind === "invitation") router.push("/admin/invitations");
      else router.refresh();
    });
  }

  return (
    <>
      <button className={`${deleteActionButton} ${iconOnly ? "px-0" : "w-auto gap-2 px-3"}`} type="button" onClick={() => dialog.current?.showModal()} aria-label={iconOnly ? label : undefined} title={iconOnly ? label : undefined}>
        <TrashIcon className="size-5" />{iconOnly ? null : <span className="text-xs font-bold">{label}</span>}
      </button>
      <dialog className="m-auto w-[min(calc(100%_-_2rem),480px)] rounded-xl border border-border bg-background p-0 text-foreground backdrop:bg-foreground/60" ref={dialog} aria-labelledby={`${kind}-${id}-dialog-title`}>
        <div className="p-6">
          <h2 id={`${kind}-${id}-dialog-title`}>{title}</h2>
          <p className="mt-3 text-muted-foreground">{description}</p>
          {error ? <p className={`${formStatus} mt-4 border-danger bg-red-50 text-red-950`} role="alert">{error}</p> : null}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end [&_button]:w-full sm:[&_button]:w-auto">
            <form method="dialog"><button className={secondaryButton} disabled={pending}>Cancelar</button></form>
            <button className={dangerButton} type="button" disabled={pending} onClick={confirmDelete}><TrashIcon className="size-5" /> {pending ? "Excluindo..." : label}</button>
          </div>
        </div>
      </dialog>
    </>
  );
}
