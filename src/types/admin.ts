import type { RSVPStatus } from "@/generated/prisma/client";

export type DashboardStats = {
  totalEligible: number;
  confirmed: number;
  declined: number;
  pending: number;
};

export type InvitationListFilter = "ALL" | RSVPStatus;

export type AdminActionState = {
  status?: "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export const emptyAdminActionState: AdminActionState = {};

