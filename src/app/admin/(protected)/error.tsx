"use client";
import { adminPage, panel, primaryButton } from "@/components/ui/styles";

export default function AdminError({ reset }: { reset: () => void }) {
  return <main className={adminPage} id="admin-content"><section className={`${panel} border-dashed px-5 py-12 text-center`}><h1 className="text-3xl font-bold">Não foi possível carregar</h1><p className="mx-auto mt-3 mb-5 max-w-136 text-muted-foreground">Os dados administrativos estão temporariamente indisponíveis.</p><button className={primaryButton} type="button" onClick={reset}>Tentar novamente</button></section></main>;
}
