import { describe, expect, it } from "vitest";
import { generateInvitationCode } from "@/lib/invitation-code";
import { assertRsvpOpen, getRsvpAvailability, RsvpError } from "@/lib/rsvp-deadline";
import { lookupInvitationSchema, submitRsvpSchema } from "@/schemas/rsvp.schema";

describe("invitation codes", () => {
  it("generates non-ambiguous eight-character codes", () => {
    const codes = Array.from({ length: 100 }, generateInvitationCode);
    expect(codes.every((code) => /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/.test(code))).toBe(true);
    expect(new Set(codes).size).toBeGreaterThan(95);
  });

  it("normalizes valid lookup codes and rejects ambiguous characters", () => {
    expect(lookupInvitationSchema.parse({ code: " 7kpx4m " })).toEqual({ code: "7KPX4M" });
    expect(lookupInvitationSchema.safeParse({ code: "OI10AB" }).success).toBe(false);
  });
});

describe("RSVP deadline", () => {
  const deadline = "2026-11-01T00:00:00-03:00";

  it("is open immediately before the deadline and reports its Fortaleza time", () => {
    expect(assertRsvpOpen(deadline, new Date("2026-11-01T02:59:59.999Z"))).toEqual(new Date("2026-11-01T03:00:00.000Z"));
    expect(getRsvpAvailability(deadline, new Date("2026-10-01T00:00:00Z")).deadlineLabel).toContain("31 de outubro de 2026");
  });

  it("closes exactly at the deadline and fails safely when unconfigured", () => {
    expect(() => assertRsvpOpen(deadline, new Date("2026-11-01T03:00:00.000Z"))).toThrowError(expect.objectContaining({ code: "CLOSED" }));
    expect(() => assertRsvpOpen(undefined, new Date())).toThrowError(expect.objectContaining({ code: "UNAVAILABLE" }));
  });
});

describe("RSVP payload validation", () => {
  it("accepts individual answers, normalizes the code, and turns cleared optional fields into null", () => {
    const result = submitRsvpSchema.parse({
      code: " 7kpx4m ",
      guests: [{ guestId: "guest-1", status: "CONFIRMED", phone: "  ", message: " Com carinho " }],
    });
    expect(result).toEqual({
      code: "7KPX4M",
      guests: [{ guestId: "guest-1", status: "CONFIRMED", phone: null, message: "Com carinho" }],
    });
  });

  it("rejects pending statuses and repeated guest identifiers", () => {
    expect(submitRsvpSchema.safeParse({ code: "7KPX4M", guests: [{ guestId: "guest-1", status: "PENDING" }] }).success).toBe(false);
    expect(submitRsvpSchema.safeParse({
      code: "7KPX4M",
      guests: [
        { guestId: "guest-1", status: "CONFIRMED" },
        { guestId: "guest-1", status: "DECLINED" },
      ],
    }).success).toBe(false);
  });
});

// Keep the domain error imported and exercised as the public service boundary.
expect(new RsvpError("INVALID_CODE").message).toBe("INVALID_CODE");
