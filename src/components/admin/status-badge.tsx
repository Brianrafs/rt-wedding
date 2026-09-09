import type { RSVPStatus } from "@/generated/prisma/client";

const labels: Record<RSVPStatus, string> = {
  CONFIRMED: "Confirmado",
  DECLINED: "Não irá",
  PENDING: "Aguardando",
};

export function StatusBadge({ status, requiresRsvp = true }: { status: RSVPStatus; requiresRsvp?: boolean }) {
  const base = "inline-flex min-h-7 items-center rounded-full border px-2 py-1 text-[0.65rem] font-bold";
  if (!requiresRsvp && status === "PENDING") return <span className={`${base} border-slate-500 bg-slate-100 text-slate-700`}>Não precisa responder</span>;
  const variants = {
    CONFIRMED: "border-emerald-700 bg-emerald-50 text-emerald-800",
    DECLINED: "border-red-700 bg-red-50 text-red-800",
    PENDING: "border-amber-700 bg-amber-50 text-amber-800",
  };
  const label = !requiresRsvp
    ? status === "CONFIRMED" ? "Confirmado pela família" : "Não irá com a família"
    : labels[status];
  return <span className={`${base} ${variants[status]}`}>{label}</span>;
}
