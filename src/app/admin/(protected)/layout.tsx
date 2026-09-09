import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/actions/auth.actions";
import { getCurrentAdmin } from "@/lib/auth";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return (
    <div className="admin-shell">
      <a className="skip-link" href="#admin-content">Pular para o conteúdo</a>
      <header className="admin-header">
        <Link className="admin-header-brand" href="/admin">Ryelthon & Thayna</Link>
        <nav aria-label="Administração">
          <Link href="/admin">Resumo</Link>
          <Link href="/admin/invitations">Convites</Link>
        </nav>
        <div className="admin-account">
          <span>{admin.username}</span>
          <form action={logoutAction}><button type="submit">Sair</button></form>
        </div>
      </header>
      {children}
    </div>
  );
}
