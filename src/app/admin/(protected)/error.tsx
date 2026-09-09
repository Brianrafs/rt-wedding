"use client";

export default function AdminError({ reset }: { reset: () => void }) {
  return <main className="admin-page" id="admin-content"><section className="admin-empty-state"><h1>Não foi possível carregar</h1><p>Os dados administrativos estão temporariamente indisponíveis.</p><button className="admin-primary-button" type="button" onClick={reset}>Tentar novamente</button></section></main>;
}
