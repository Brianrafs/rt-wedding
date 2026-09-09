"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteGuestAction, deleteInvitationAction } from "@/actions/admin.actions";

type Props = {
  id: string;
  kind: "invitation" | "guest";
  label: string;
  title: string;
  description: string;
};

export function ConfirmDeleteButton({ id, kind, label, title, description }: Props) {
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
      <button className="admin-text-button is-danger" type="button" onClick={() => dialog.current?.showModal()}>{label}</button>
      <dialog className="admin-dialog" ref={dialog} aria-labelledby={`${kind}-${id}-dialog-title`}>
        <div className="admin-dialog-content">
          <h2 id={`${kind}-${id}-dialog-title`}>{title}</h2>
          <p>{description}</p>
          {error ? <p className="admin-form-status is-error" role="alert">{error}</p> : null}
          <div className="admin-dialog-actions">
            <form method="dialog"><button className="admin-secondary-button" disabled={pending}>Cancelar</button></form>
            <button className="admin-danger-button" type="button" disabled={pending} onClick={confirmDelete}>{pending ? "Excluindo..." : label}</button>
          </div>
        </div>
      </dialog>
    </>
  );
}

