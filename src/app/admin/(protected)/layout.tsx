import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/actions/auth.actions";
import { getCurrentAdmin } from "@/lib/auth";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return (
    <div className="admin-shell">
      <header className="admin-header">
        <Link className="admin-header-brand" href="/admin">Ryelthon & Thayna</Link>
        <div>
          <span>{admin.username}</span>
          <form action={logoutAction}><button type="submit">Sair</button></form>
        </div>
      </header>
      {children}
    </div>
  );
}
