import { describe, expect, it } from "vitest";
import { getCountdown } from "@/lib/countdown";
import { resolveWeddingDate } from "@/lib/wedding-date";

describe("wedding date and countdown", () => {
  it("targets midnight in Fortaleza without claiming a ceremony time", () => {
    expect(resolveWeddingDate()).toEqual({
      datetime: "2026-12-10T03:00:00.000Z",
      hasCeremonyTime: false,
      timeLabel: "Horário em breve",
    });
  });

  it("uses a configured ceremony time consistently in the event timezone", () => {
    expect(resolveWeddingDate("2026-12-10T21:00:00Z")).toEqual({
      datetime: "2026-12-10T21:00:00.000Z",
      hasCeremonyTime: true,
      timeLabel: "18:00",
    });
  });

  it("rejects missing timezone, invalid dates, and a different local wedding day", () => {
    for (const value of ["2026-12-10", "2026-12-10T18:00:00", "invalid", "2026-12-10T02:00:00Z"]) {
      expect(() => resolveWeddingDate(value)).toThrow("WEDDING_DATE");
    }
  });

  it("splits remaining time into days, hours, minutes, and seconds", () => {
    const target = Date.parse("2026-12-10T03:00:00Z");
    expect(getCountdown(target, target - (86400 + 7200 + 180 + 4) * 1000)).toEqual({
      days: 1, hours: 2, minutes: 3, seconds: 4, complete: false,
    });
    expect(getCountdown(target, target - 1)).toMatchObject({ seconds: 1, complete: false });
  });

  it("never returns negative values at or after the target", () => {
    for (const now of [1000, 1001, 1000000]) {
      expect(getCountdown(1000, now)).toEqual({
        days: 0, hours: 0, minutes: 0, seconds: 0, complete: true,
      });
    }
  });
});
