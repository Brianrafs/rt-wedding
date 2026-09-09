import { adminPage } from "@/components/ui/styles";

export default function AdminLoading() {
  return <main className={adminPage} id="admin-content"><p className="py-12 text-center text-muted-foreground" role="status">Carregando dados...</p></main>;
}
