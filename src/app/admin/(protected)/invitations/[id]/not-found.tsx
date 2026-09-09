import Link from "next/link";
import { adminPage, panel, primaryButton } from "@/components/ui/styles";

export default function InvitationNotFound() {
  return <main className={adminPage} id="admin-content"><section className={`${panel} border-dashed px-5 py-12 text-center`}><h1 className="text-3xl font-bold">Convite não encontrado</h1><p className="mx-auto mt-3 mb-5 max-w-136 text-muted-foreground">Ele pode ter sido removido ou o endereço está incorreto.</p><Link className={primaryButton} href="/admin/invitations">Voltar para convites</Link></section></main>;
}
