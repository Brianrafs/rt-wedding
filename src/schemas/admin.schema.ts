import { z } from "zod";

const requiredName = z.string().trim().min(1, "Informe um nome.").max(120, "Use no máximo 120 caracteres.");
const optionalText = (max: number) => z.string().trim().max(max, `Use no máximo ${max} caracteres.`)
  .transform((value) => value || null);

export const adminIdSchema = z.string().min(1).max(64);

export const createGuestSchema = z.object({
  name: requiredName,
  requiresRsvp: z.boolean(),
  phone: optionalText(40),
  dietaryRestriction: optionalText(500),
  notes: optionalText(1000),
  message: optionalText(2000),
}).strict();

export const updateGuestSchema = createGuestSchema;

export const createInvitationSchema = z.object({
  name: requiredName,
  guests: z.array(createGuestSchema).min(1, "Adicione pelo menos um convidado.").max(100),
}).strict();

export const updateInvitationSchema = z.object({ name: requiredName }).strict();

export const invitationListQuerySchema = z.object({
  query: z.string().trim().max(120).default(""),
  status: z.enum(["ALL", "PENDING", "CONFIRMED", "DECLINED"]).default("ALL"),
}).strict();

