"use server";

import { getDb } from "@/lib/db";
import { getRsvpAvailability, RsvpError } from "@/lib/rsvp-deadline";
import { lookupInvitation, submitRsvp } from "@/services/rsvp.service";
import type { PublicInvitation, RsvpAvailability, RsvpErrorCode, RsvpResult } from "@/types/rsvp";

const messages: Record<RsvpErrorCode, string> = {
  INVALID_CODE: "Não encontramos um convite com esse código. Verifique o código recebido e tente novamente.",
  INVALID_INPUT: "Revise as respostas. Escolha uma opção para cada pessoa e confira o tamanho dos campos opcionais.",
  CHANGED: "Seu convite foi atualizado. Consulte o código novamente antes de responder.",
  CLOSED: "As confirmações foram encerradas. Se precisar, entre em contato diretamente com os noivos.",
  UNAVAILABLE: "As confirmações ainda não estão disponíveis. Por favor, tente novamente mais tarde.",
  FAILED: "Não foi possível concluir agora. Suas alterações foram mantidas na tela. Tente novamente.",
};

function failure<T>(error: unknown): RsvpResult<T> {
  const code = error instanceof RsvpError ? error.code : "FAILED";
  if (code === "FAILED") console.error("RSVP operation failed.");
  return { ok: false, code, message: messages[code] };
}

export async function rsvpAvailabilityAction(): Promise<RsvpResult<RsvpAvailability>> {
  try {
    return { ok: true, data: getRsvpAvailability(process.env.RSVP_DEADLINE) };
  } catch (error) {
    return failure(error);
  }
}

export async function lookupInvitationAction(input: unknown): Promise<RsvpResult<PublicInvitation>> {
  try {
    // Check configuration/deadline before initializing database infrastructure.
    getRsvpAvailability(process.env.RSVP_DEADLINE);
    return { ok: true, data: await lookupInvitation(input, getDb(), process.env.RSVP_DEADLINE) };
  } catch (error) {
    return failure(error);
  }
}

export async function submitRsvpAction(input: unknown): Promise<RsvpResult<PublicInvitation>> {
  try {
    getRsvpAvailability(process.env.RSVP_DEADLINE);
    return { ok: true, data: await submitRsvp(input, getDb(), process.env.RSVP_DEADLINE) };
  } catch (error) {
    return failure(error);
  }
}
