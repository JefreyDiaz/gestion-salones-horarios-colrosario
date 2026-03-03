import { NextRequest, NextResponse } from "next/server";
import { ZodError, z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { createReservationSchema, reservationQuerySchema } from "@/lib/validation/reservations";

type ErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "CONFLICT"
  | "NOT_FOUND"
  | "INTERNAL_ERROR"
  | "RATE_LIMITED";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 15;
const writeRateBucket = new Map<string, number[]>();
const SUPABASE_RETRY_DELAYS_MS = [250, 800];
const deleteReservationQuerySchema = z.object({
  id: z.uuid("Id de reserva invalido."),
});

interface ReservationRow {
  id: string;
  room_name: string;
  reservation_date: string;
  day_name: string;
  start_time: string;
  end_time: string;
  reserved_by: string;
  subject_name: string;
  grade_name: string;
}

interface SupabaseErrorLike {
  code?: string;
  message: string;
}

interface SupabaseResult<TData> {
  data: TData | null;
  error: SupabaseErrorLike | null;
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return "unknown";
}

function errorResponse(status: number, code: ErrorCode, message: string): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

function rateLimitExceeded(clientIp: string): boolean {
  const now = Date.now();
  const previous = writeRateBucket.get(clientIp) ?? [];
  const active = previous.filter((timestamp) => now - timestamp <= RATE_LIMIT_WINDOW_MS);
  if (active.length >= RATE_LIMIT_MAX_REQUESTS) {
    writeRateBucket.set(clientIp, active);
    return true;
  }
  active.push(now);
  writeRateBucket.set(clientIp, active);
  return false;
}

function isAdminAuthorized(request: NextRequest): boolean {
  const requiredToken = process.env.ADMIN_PANEL_TOKEN;
  if (!requiredToken) {
    return false;
  }
  const headerToken = request.headers.get("x-admin-token");
  const cookieToken = request.cookies.get("admin_panel_session")?.value;
  return headerToken === requiredToken || cookieToken === requiredToken;
}

function toMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function normalizeTime(value: string): string {
  return value.slice(0, 5);
}

function isTransientSupabaseError(error: SupabaseErrorLike | null): boolean {
  if (!error) {
    return false;
  }
  const message = error.message.toLowerCase();
  return (
    message.includes("fetch failed") ||
    message.includes("network") ||
    message.includes("timeout") ||
    message.includes("timed out")
  );
}

async function delay(ms: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function runSupabaseWithRetry<TData>(
  operation: () => Promise<SupabaseResult<TData>>,
): Promise<SupabaseResult<TData>> {
  let result = await operation();
  if (!isTransientSupabaseError(result.error)) {
    return result;
  }

  for (const waitMs of SUPABASE_RETRY_DELAYS_MS) {
    await delay(waitMs);
    result = await operation();
    if (!isTransientSupabaseError(result.error)) {
      return result;
    }
  }

  return result;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const queryParams = reservationQuerySchema.parse({
      room: request.nextUrl.searchParams.get("room"),
      startDate: request.nextUrl.searchParams.get("startDate"),
      endDate: request.nextUrl.searchParams.get("endDate"),
    });

    if (queryParams.startDate > queryParams.endDate) {
      return errorResponse(400, "BAD_REQUEST", "El rango de fechas es invalido.");
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await runSupabaseWithRetry(async () =>
      await supabase
        .from("reservations")
        .select(
          "id, room_name, reservation_date, day_name, start_time, end_time, reserved_by, subject_name, grade_name",
        )
        .eq("room_name", queryParams.room)
        .gte("reservation_date", queryParams.startDate)
        .lte("reservation_date", queryParams.endDate)
        .order("reservation_date", { ascending: true })
        .order("start_time", { ascending: true }),
    );

    if (error) {
      console.error("GET /api/reservations failed", {
        code: error.code,
        message: error.message,
        room: queryParams.room,
      });
      return errorResponse(500, "INTERNAL_ERROR", "No fue posible consultar reservas por un problema de conexion.");
    }

    const rows = (data ?? []) as ReservationRow[];

    return NextResponse.json({
      data: rows.map((item) => ({
        id: item.id,
        room: item.room_name,
        date: item.reservation_date,
        day: item.day_name,
        start: normalizeTime(item.start_time),
        end: normalizeTime(item.end_time),
        reservedBy: item.reserved_by,
        subject: item.subject_name,
        grade: item.grade_name,
      })),
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(400, "BAD_REQUEST", error.issues[0]?.message ?? "Parametros invalidos.");
    }
    console.error("Unexpected GET /api/reservations error", error);
    return errorResponse(500, "INTERNAL_ERROR", "Error interno consultando reservas.");
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    if (!isAdminAuthorized(request)) {
      return errorResponse(401, "UNAUTHORIZED", "Token de admin invalido o ausente.");
    }

    const clientIp = getClientIp(request);
    if (rateLimitExceeded(clientIp)) {
      return errorResponse(429, "RATE_LIMITED", "Demasiadas solicitudes. Intenta de nuevo en un minuto.");
    }

    const payload = createReservationSchema.parse(await request.json());
    if (toMinutes(payload.start) >= toMinutes(payload.end)) {
      return errorResponse(400, "BAD_REQUEST", "La hora de inicio debe ser menor a la hora de fin.");
    }

    const supabase = getSupabaseServerClient();

    const { data: overlapRows, error: overlapError } = await runSupabaseWithRetry(async () =>
      await supabase
        .from("reservations")
        .select("id")
        .eq("room_name", payload.room)
        .eq("reservation_date", payload.date)
        .lt("start_time", payload.end)
        .gt("end_time", payload.start)
        .limit(1),
    );

    if (overlapError) {
      console.error("POST /api/reservations overlap check failed", {
        code: overlapError.code,
        room: payload.room,
        date: payload.date,
      });
      return errorResponse(500, "INTERNAL_ERROR", "No fue posible validar solapamientos por un problema de conexion.");
    }

    if ((overlapRows ?? []).length > 0) {
      return errorResponse(409, "CONFLICT", "Ya existe una reserva que se cruza con ese horario.");
    }

    const { data: insertedRows, error: insertError } = await runSupabaseWithRetry(async () =>
      await supabase
        .from("reservations")
        .insert({
          room_name: payload.room,
          reservation_date: payload.date,
          day_name: payload.day,
          start_time: payload.start,
          end_time: payload.end,
          reserved_by: payload.reservedBy,
          subject_name: payload.subject,
          grade_name: payload.grade,
        })
        .select(
          "id, room_name, reservation_date, day_name, start_time, end_time, reserved_by, subject_name, grade_name",
        )
        .limit(1),
    );

    if (insertError) {
      console.error("POST /api/reservations insert failed", {
        code: insertError.code,
        room: payload.room,
        date: payload.date,
      });
      return errorResponse(500, "INTERNAL_ERROR", "No fue posible guardar la reserva.");
    }

    const inserted = (insertedRows?.[0] ?? null) as ReservationRow | null;
    return NextResponse.json(
      {
        data: inserted
          ? {
              id: inserted.id,
              room: inserted.room_name,
              date: inserted.reservation_date,
              day: inserted.day_name,
              start: normalizeTime(inserted.start_time),
              end: normalizeTime(inserted.end_time),
              reservedBy: inserted.reserved_by,
              subject: inserted.subject_name,
              grade: inserted.grade_name,
            }
          : null,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(400, "BAD_REQUEST", error.issues[0]?.message ?? "Payload invalido.");
    }
    console.error("Unexpected POST /api/reservations error", error);
    return errorResponse(500, "INTERNAL_ERROR", "Error interno guardando reserva.");
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    if (!isAdminAuthorized(request)) {
      return errorResponse(401, "UNAUTHORIZED", "Token de admin invalido o ausente.");
    }

    const clientIp = getClientIp(request);
    if (rateLimitExceeded(clientIp)) {
      return errorResponse(429, "RATE_LIMITED", "Demasiadas solicitudes. Intenta de nuevo en un minuto.");
    }

    const query = deleteReservationQuerySchema.parse({
      id: request.nextUrl.searchParams.get("id"),
    });

    const supabase = getSupabaseServerClient();
    const { data: deletedRows, error: deleteError } = await runSupabaseWithRetry(async () =>
      await supabase.from("reservations").delete().eq("id", query.id).select("id").limit(1),
    );

    if (deleteError) {
      console.error("DELETE /api/reservations failed", {
        code: deleteError.code,
        message: deleteError.message,
        id: query.id,
      });
      return errorResponse(500, "INTERNAL_ERROR", "No fue posible eliminar la reserva.");
    }

    if ((deletedRows ?? []).length === 0) {
      return errorResponse(404, "NOT_FOUND", "La reserva ya no existe.");
    }

    return NextResponse.json({ data: { id: query.id } });
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(400, "BAD_REQUEST", error.issues[0]?.message ?? "Parametros invalidos.");
    }
    console.error("Unexpected DELETE /api/reservations error", error);
    return errorResponse(500, "INTERNAL_ERROR", "Error interno eliminando reserva.");
  }
}
