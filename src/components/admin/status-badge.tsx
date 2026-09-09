import type { RSVPStatus } from "@/generated/prisma/client";

const labels: Record<RSVPStatus, string> = {
  CONFIRMED: "Confirmado",
  DECLINED: "Não irá",
  PENDING: "Aguardando",
};

export function StatusBadge({ status, requiresRsvp = true }: { status: RSVPStatus; requiresRsvp?: boolean }) {
  if (!requiresRsvp) return <span className="admin-badge is-neutral">Não precisa responder</span>;
  return <span className={`admin-badge is-${status.toLowerCase()}`}>{labels[status]}</span>;
}
