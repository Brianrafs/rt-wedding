import Link from "next/link";

export default function InvitationNotFound() {
  return <main className="admin-page" id="admin-content"><section className="admin-empty-state"><h1>Convite não encontrado</h1><p>Ele pode ter sido removido ou o endereço está incorreto.</p><Link className="admin-primary-link" href="/admin/invitations">Voltar para convites</Link></section></main>;
}

