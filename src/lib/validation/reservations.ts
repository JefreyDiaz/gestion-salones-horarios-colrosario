import { z } from "zod";
import { DAYS, ROOMS } from "@/lib/schedule";

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export const reservationQuerySchema = z.object({
  room: z.enum(ROOMS),
  startDate: z.string().regex(ISO_DATE_REGEX, "Fecha de inicio invalida"),
  endDate: z.string().regex(ISO_DATE_REGEX, "Fecha de fin invalida"),
});

export const createReservationSchema = z.object({
  room: z.enum(ROOMS),
  date: z.string().regex(ISO_DATE_REGEX, "Fecha invalida"),
  day: z.enum(DAYS),
  start: z.string().regex(TIME_REGEX, "Hora de inicio invalida"),
  end: z.string().regex(TIME_REGEX, "Hora de fin invalida"),
  reservedBy: z.string().trim().min(2).max(120),
  subject: z.string().trim().min(2).max(120),
  grade: z.string().trim().min(1).max(40),
});

export type ReservationQueryInput = z.infer<typeof reservationQuerySchema>;
export type CreateReservationInput = z.infer<typeof createReservationSchema>;
