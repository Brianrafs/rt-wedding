import { describe, expect, it } from "vitest";
import { createGuestSchema, createInvitationSchema, invitationListQuerySchema } from "@/schemas/admin.schema";
import { calculateDashboardStats } from "@/services/admin.service";

describe("admin validation", () => {
  it("accepts an invitation with guests and normalizes optional values", () => {
    expect(createInvitationSchema.parse({
      name: " Família Silva ",
      guests: [{
        name: " Maria Silva ", requiresRsvp: true, phone: " ", dietaryRestriction: " Vegetariana ", notes: "", message: "",
      }],
    })).toEqual({
      name: "Família Silva",
      guests: [{ name: "Maria Silva", requiresRsvp: true, phone: null, dietaryRestriction: "Vegetariana", notes: null, message: null }],
    });
  });

  it("rejects empty invitations and invalid guest data", () => {
    expect(createInvitationSchema.safeParse({ name: "Família", guests: [] }).success).toBe(false);
    expect(createGuestSchema.safeParse({ name: "", requiresRsvp: true, phone: "", dietaryRestriction: "", notes: "", message: "" }).success).toBe(false);
  });

  it("uses safe defaults when list filters are omitted", () => {
    expect(invitationListQuerySchema.parse({})).toEqual({ query: "", status: "ALL" });
  });
});

describe("dashboard metrics", () => {
  it("counts only RSVP-eligible guests and preserves the total invariant", () => {
    const stats = calculateDashboardStats([
      { requiresRsvp: true, status: "CONFIRMED" },
      { requiresRsvp: true, status: "DECLINED" },
      { requiresRsvp: true, status: "PENDING" },
      { requiresRsvp: false, status: "PENDING" },
      { requiresRsvp: false, status: "CONFIRMED" },
    ]);
    expect(stats).toEqual({ totalEligible: 3, confirmed: 1, declined: 1, pending: 1 });
    expect(stats.totalEligible).toBe(stats.confirmed + stats.declined + stats.pending);
  });
});

