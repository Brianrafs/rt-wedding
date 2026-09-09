import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(256),
}).strict();

export const initialAdminSchema = z.object({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(256),
}).strict();
