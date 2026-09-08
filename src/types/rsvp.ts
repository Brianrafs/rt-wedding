export type RsvpStatus = "PENDING" | "CONFIRMED" | "DECLINED";

export type PublicInvitation = {
  name: string;
  guests: Array<{
    id: string;
    name: string;
    requiresRsvp: boolean;
    status: RsvpStatus;
    phone: string | null;
    dietaryRestriction: string | null;
    notes: string | null;
    message: string | null;
  }>;
};

export type RsvpErrorCode = "INVALID_CODE" | "INVALID_INPUT" | "CHANGED" | "CLOSED" | "UNAVAILABLE" | "FAILED";
export type RsvpResult<T> = { ok: true; data: T } | { ok: false; code: RsvpErrorCode; message: string };
export type RsvpAvailability = { deadlineLabel: string };
