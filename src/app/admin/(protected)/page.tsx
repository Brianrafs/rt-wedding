import type { Metadata } from "next";

export const metadata: Metadata = { title: "Administração | Ryelthon & Thayna" };

export default function AdminPage() {
  return (
    <main className="admin-placeholder">
      <p className="admin-eyebrow">Administração</p>
      <h1>Área administrativa</h1>
      <p>Seu acesso está protegido. A gestão dos convites será implementada no M5.</p>
    </main>
  );
}
