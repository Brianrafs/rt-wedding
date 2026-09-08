import { z } from "zod";
import { wedding } from "@/constants/wedding";

export function resolveWeddingDate(value?: string) {
  const result = z.iso.datetime({ offset: true }).safeParse(value || wedding.startOfDay);
  if (!result.success) throw new Error("Invalid WEDDING_DATE configuration.");

  const date = new Date(result.data);
  const localDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: wedding.timeZone, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(date);
  if (localDate !== wedding.date) {
    throw new Error("WEDDING_DATE must fall on the confirmed wedding date in America/Fortaleza.");
  }
  const hasCeremonyTime = date.getTime() !== Date.parse(wedding.startOfDay);
  return {
    datetime: date.toISOString(),
    hasCeremonyTime,
    timeLabel: hasCeremonyTime
      ? new Intl.DateTimeFormat("pt-BR", {
        timeZone: wedding.timeZone, hour: "2-digit", minute: "2-digit",
      }).format(date)
      : "Horário em breve",
  };
}
