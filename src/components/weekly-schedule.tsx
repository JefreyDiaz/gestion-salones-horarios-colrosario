"use client";

import { useEffect, useMemo, useState } from "react";
import { DAYS, slots, type Slot } from "@/lib/schedule";

const statusStyles: Record<Slot["status"], string> = {
  free: "bg-white text-slate-600",
  fixed: "",
  reserved: "bg-[#fff0c9] text-slate-900 border-[#e4c36f]",
  pending: "bg-[#f3c6d3] text-slate-900 border-[#d8b7c0]",
};

const statusLabels: Record<Slot["status"], string> = {
  free: "Libre",
  fixed: "Clase fija",
  reserved: "Reservado",
  pending: "Pendiente",
};

interface WeeklyScheduleProps {
  room: Slot["room"];
  title?: string;
  weekStart: Date;
}

interface ReservationItem {
  id: string;
  room: Slot["room"];
  date: string;
  day: (typeof DAYS)[number];
  start: string;
  end: string;
  subject: string;
  grade: string;
  reservedBy: string;
}

const BLOCK_COLORS = [
  "bg-[#d7d9b3]",
  "bg-[#b7b86a]",
  "bg-[#b9b7e6]",
  "bg-[#f0ef60]",
  "bg-[#b996c0]",
  "bg-[#6bb8f3]",
  "bg-[#f27f86]",
  "bg-[#88d08b]",
  "bg-[#f4d557]",
  "bg-[#70d6d8]",
  "bg-[#c5cf7a]",
  "bg-[#8b8acb]",
  "bg-[#35c2cc]",
  "bg-[#e6b8bc]",
  "bg-[#1f95f3]",
  "bg-[#f1b8f0]",
  "bg-[#f7ca9a]",
  "bg-[#ff9d2e]",
];

const TIMELINE_HEIGHT = 620;
const MINUTES_GUTTER = 30;

function toMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatRange(start: string, end: string): string {
  return `${start}/${end}`;
}

function addDays(base: Date, amount: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + amount);
  return next;
}

function toIsoDate(value: Date): string {
  return value.toISOString().split("T")[0];
}

function formatDateLabel(date: Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function getFixedColor(course: string): string {
  const hash = Array.from(course).reduce((acc, char) => acc + (char.codePointAt(0) ?? 0), 0);
  return BLOCK_COLORS[hash % BLOCK_COLORS.length];
}

export function WeeklySchedule({ room, title, weekStart }: Readonly<WeeklyScheduleProps>) {
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [reservationsError, setReservationsError] = useState("");

  const roomSlots = useMemo(
    () =>
      slots
        .filter((slot) => slot.room === room)
        .sort((a, b) => toMinutes(a.start) - toMinutes(b.start)),
    [room],
  );
  const weekDays = DAYS.map((day, index) => {
    const date = addDays(weekStart, index);
    return {
      day,
      dateIso: toIsoDate(date),
      dateLabel: formatDateLabel(date),
    };
  });
  const startDate = weekDays[0]?.dateIso;
  const endDate = weekDays.at(-1)?.dateIso;

  useEffect(() => {
    const controller = new AbortController();
    async function fetchReservations() {
      if (!startDate || !endDate) {
        return;
      }

      setLoadingReservations(true);
      setReservationsError("");
      try {
        const params = new URLSearchParams({
          room,
          startDate,
          endDate,
        });
        const response = await fetch(`/api/reservations?${params.toString()}`, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });
        const payload = (await response.json()) as {
          data?: ReservationItem[];
          error?: { message?: string };
        };

        if (!response.ok) {
          setReservationsError(payload.error?.message ?? "No fue posible cargar reservas.");
          return;
        }

        setReservations(payload.data ?? []);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setReservationsError("No fue posible cargar reservas.");
      } finally {
        setLoadingReservations(false);
      }
    }

    void fetchReservations();
    return () => controller.abort();
  }, [room, startDate, endDate]);

  const minStart = Math.min(...roomSlots.map((slot) => toMinutes(slot.start)));
  const maxEnd = Math.max(...roomSlots.map((slot) => toMinutes(slot.end)));
  const totalMinutes = maxEnd - minStart + MINUTES_GUTTER;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#8f1530]">{title ?? room}</h2>
        <div className="flex flex-wrap gap-2 text-xs">
          {Object.entries(statusLabels).map(([status, label]) => (
            <span
              key={status}
              className={`rounded border border-[#d8b7c0] px-2 py-1 ${
                status === "fixed" ? "bg-[#f2f2f2] text-slate-700" : statusStyles[status as Slot["status"]]
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
      {loadingReservations && <p className="text-sm text-slate-600">Cargando reservas...</p>}
      {reservationsError && <p className="text-sm text-red-700">{reservationsError}</p>}

      <div className="overflow-x-auto rounded-lg border border-[#d8b7c0] bg-white shadow-sm">
        <table className="min-w-[1000px] w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#f8e8ed]">
              {weekDays.map((item) => (
                <th key={item.dateIso} className="border border-[#d8b7c0] p-2 text-center text-[#8f1530]">
                  <p>{item.day}</p>
                  <p className="text-xs font-normal text-slate-600">{item.dateLabel}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {weekDays.map((item) => {
                const fixedBlocks = roomSlots
                  .filter((slot) => slot.day === item.day)
                  .map((slot) => ({
                    id: slot.id,
                    start: slot.start,
                    end: slot.end,
                    subject: slot.subject,
                    grade: slot.course,
                    teacher: slot.teacher,
                    status: "fixed" as Slot["status"],
                  }));

                const reservedBlocks = reservations
                  .filter((reservation) => reservation.date === item.dateIso)
                  .map((reservation) => ({
                    id: reservation.id,
                    start: reservation.start,
                    end: reservation.end,
                    subject: reservation.subject,
                    grade: reservation.grade,
                    teacher: reservation.reservedBy,
                    status: "reserved" as Slot["status"],
                  }));

                const daySlots = [...fixedBlocks, ...reservedBlocks].sort(
                  (a, b) => toMinutes(a.start) - toMinutes(b.start),
                );

                return (
                  <td key={item.dateIso} className="border border-[#d8b7c0] bg-white align-top">
                    <div className="relative" style={{ height: `${TIMELINE_HEIGHT}px` }}>
                      {daySlots.map((slot) => {
                        const start = toMinutes(slot.start);
                        const end = toMinutes(slot.end);
                        const durationMinutes = end - start;
                        const offsetRatio = (start - minStart) / totalMinutes;
                        const durationRatio = durationMinutes / totalMinutes;
                        const top = Math.max(0, Math.round(offsetRatio * TIMELINE_HEIGHT));
                        const height = Math.max(42, Math.round(durationRatio * TIMELINE_HEIGHT));
                        const isTinyBlock = durationMinutes <= 45;
                        const isCompactBlock = durationMinutes <= 55;

                        return (
                          <article
                            key={slot.id}
                            className={`absolute left-0 right-0 m-0.5 overflow-hidden rounded border p-1.5 ${
                              slot.status === "fixed"
                                ? `${getFixedColor(slot.grade)} border-zinc-500`
                                : statusStyles[slot.status]
                            }`}
                            style={{ top: `${top}px`, height: `${height}px` }}
                            title={`${slot.subject} - ${slot.grade} - ${slot.teacher} (${slot.start}-${slot.end})`}
                          >
                            <p className="text-[11px] leading-none text-right text-slate-700">
                              {formatRange(slot.start, slot.end)}
                            </p>
                            <p
                              className={`mt-1 overflow-hidden font-semibold leading-tight text-slate-900 ${
                                isCompactBlock ? "text-base" : "text-lg"
                              }`}
                            >
                              {slot.subject}
                            </p>
                            {!isTinyBlock && <p className="truncate text-xs font-medium text-slate-800">{slot.grade}</p>}
                            {!isCompactBlock && <p className="truncate text-[10px] leading-tight text-slate-700">{slot.teacher}</p>}
                          </article>
                        );
                      })}
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
