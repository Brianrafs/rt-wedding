"use client";

import { useState } from "react";

export function CopyCodeButton({ code }: { code: string }) {
  const [message, setMessage] = useState("");
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setMessage("Código copiado.");
    } catch {
      setMessage("Não foi possível copiar. Selecione o código exibido.");
    }
  }
  return (
    <span className="admin-copy-control">
      <button className="admin-secondary-button" type="button" onClick={copyCode}>Copiar código</button>
      {message ? <span className="admin-copy-status" role="status">{message}</span> : null}
    </span>
  );
}
