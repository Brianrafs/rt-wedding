"use client";

import { useState } from "react";
import { CopyIcon } from "@/components/ui/icons";
import { copyActionButton } from "@/components/ui/styles";

export function CopyCodeButton({ code, iconOnly = false }: { code: string; iconOnly?: boolean }) {
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
    <span className="inline-flex flex-col items-start gap-1">
      <button className={`${copyActionButton} ${iconOnly ? "px-0" : "w-auto gap-2 px-3"}`} type="button" onClick={copyCode} aria-label={iconOnly ? "Copiar código" : undefined} title={iconOnly ? "Copiar código" : undefined}>
        <CopyIcon className="size-5" />{iconOnly ? null : <span className="text-xs font-bold">Copiar código</span>}
      </button>
      {message ? <span className="max-w-52 text-[0.65rem] text-muted-foreground" role="status">{message}</span> : null}
    </span>
  );
}
