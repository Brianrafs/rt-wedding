"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  AdminRecordNotFoundError,
  AdminValidationError,
  createGuest,
  createInvitation,
  deleteGuest,
  deleteInvitation,
  updateGuest,
  updateInvitation,
} from "@/services/admin.service";
import type { AdminActionState } from "@/types/admin";

const unavailableMessage = "Não foi possível salvar agora. Tente novamente.";

function adminGuestFieldsFromFormData(formData: FormData) {
  return {
    name: formData.get("name"),
    requiresRsvp: formData.get("requiresRsvp") === "true",
  };
}

const emptyGuestDetails = { phone: "", dietaryRestriction: "", notes: "", message: "" };

function actionFailure(error: unknown): AdminActionState {
  if (error instanceof AdminValidationError) {
    return { status: "error", message: "Revise os campos indicados.", fieldErrors: error.fieldErrors };
  }
  if (error instanceof AdminRecordNotFoundError) {
    return { status: "error", message: "Este cadastro não existe mais. Atualize a página." };
  }
  console.error("Admin management operation failed.");
  return { status: "error", message: unavailableMessage };
}

export async function createInvitationAction(_: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin();
  let invitationId: string;
  try {
    const names = formData.getAll("guestName");
    const eligibility = formData.getAll("guestRequiresRsvp");
    const invitation = await createInvitation({
      name: formData.get("name"),
      guests: names.map((name, index) => ({
        name,
        requiresRsvp: eligibility[index] === "true",
        ...emptyGuestDetails,
      })),
    }, getDb());
    invitationId = invitation.id;
  } catch (error) {
    return actionFailure(error);
  }
  revalidatePath("/admin");
  revalidatePath("/admin/invitations");
  redirect(`/admin/invitations/${invitationId}`);
}

export async function updateInvitationAction(id: string, _: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin();
  try {
    await updateInvitation(id, { name: formData.get("name") }, getDb());
    revalidatePath("/admin");
    revalidatePath("/admin/invitations");
    revalidatePath(`/admin/invitations/${id}`);
    return { status: "success", message: "Convite atualizado." };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function createGuestAction(invitationId: string, _: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin();
  try {
    await createGuest(invitationId, { ...adminGuestFieldsFromFormData(formData), ...emptyGuestDetails }, getDb());
    revalidatePath("/admin");
    revalidatePath("/admin/invitations");
    revalidatePath(`/admin/invitations/${invitationId}`);
    return { status: "success", message: "Convidado adicionado." };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function updateGuestAction(id: string, _: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin();
  try {
    const invitationId = await updateGuest(id, adminGuestFieldsFromFormData(formData), getDb());
    revalidatePath("/admin");
    revalidatePath("/admin/invitations");
    revalidatePath(`/admin/invitations/${invitationId}`);
    return { status: "success", message: "Convidado atualizado." };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function deleteInvitationAction(id: string): Promise<AdminActionState> {
  await requireAdmin();
  try {
    await deleteInvitation(id, getDb());
    revalidatePath("/admin");
    revalidatePath("/admin/invitations");
    return { status: "success", message: "Convite excluído." };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function deleteGuestAction(id: string): Promise<AdminActionState> {
  await requireAdmin();
  try {
    const invitationId = await deleteGuest(id, getDb());
    revalidatePath("/admin");
    revalidatePath("/admin/invitations");
    revalidatePath(`/admin/invitations/${invitationId}`);
    return { status: "success", message: "Convidado removido." };
  } catch (error) {
    return actionFailure(error);
  }
}
