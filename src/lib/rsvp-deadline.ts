import { z } from "zod";
import { wedding } from "@/constants/wedding";
import type { RsvpErrorCode } from "@/types/rsvp";

export class RsvpError extends Error {
  constructor(public readonly code: RsvpErrorCode) {
    super(code);
  }
}

export function assertRsvpOpen(value: string | undefined, now: Date) {
  const result = z.iso.datetime({ offset: true }).safeParse(value);
  if (!result.success) throw new RsvpError("UNAVAILABLE");
  const deadline = new Date(result.data);
  if (now.getTime() >= deadline.getTime()) throw new RsvpError("CLOSED");
  return deadline;
}

export function getRsvpAvailability(value: string | undefined, now = new Date()) {
  const deadline = assertRsvpOpen(value, now);
  // Deadline is exclusive. Display the final accepted minute to guests.
  const lastMoment = new Date(deadline.getTime() - 1);
  const date = new Intl.DateTimeFormat("pt-BR", {
    timeZone: wedding.timeZone, day: "numeric", month: "long", year: "numeric",
  }).format(lastMoment);
  const time = new Intl.DateTimeFormat("pt-BR", {
    timeZone: wedding.timeZone, hour: "2-digit", minute: "2-digit",
  }).format(lastMoment);
  return { deadlineLabel: `${date}, às ${time} (horário de Fortaleza)` };
}
