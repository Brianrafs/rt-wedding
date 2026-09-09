import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/actions/auth.actions";
import { getCurrentAdmin } from "@/lib/auth";
import { DashboardIcon, LogOutIcon, MailIcon, UsersIcon } from "@/components/ui/icons";
import { secondaryButton } from "@/components/ui/styles";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return (
    <div className="min-h-svh bg-admin-background">
      <a className="fixed top-4 left-4 z-50 -translate-y-40 bg-foreground px-4 py-3 text-background focus:translate-y-0" href="#admin-content">Pular para o conteúdo</a>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-background px-6 py-4">
        <Link className="font-bold" href="/admin">Ryelthon & Thayna</Link>
        <nav className="order-3 flex w-full gap-1 overflow-x-auto sm:order-none sm:w-auto" aria-label="Administração">
          <Link className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-semibold hover:bg-admin-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-hover" href="/admin"><DashboardIcon className="size-5" /> Resumo</Link>
          <Link className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-semibold hover:bg-admin-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-hover" href="/admin/invitations"><UsersIcon className="size-5" /> Convites</Link>
          <Link className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-semibold hover:bg-admin-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-hover" href="/admin/messages"><MailIcon className="size-5" /> Mensagens</Link>
        </nav>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{admin.username}</span>
          <form className="inline-flex" action={logoutAction}><button className={`${secondaryButton} text-foreground`} type="submit"><LogOutIcon className="size-5" /> Sair</button></form>
        </div>
      </header>
      {children}
    </div>
  );
}
