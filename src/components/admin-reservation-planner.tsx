"use client";

import { useMemo, useState } from "react";
import { DAYS, ROOMS, slots, type Day, type Slot } from "@/lib/schedule";

type ReserveMode = "full" | "custom";

interface ManualReservation {
  id: string;
  room: Slot["room"];
  date: string;
  day: Day;
  start: string;
  end: string;
  reservedBy: string;
  subject: string;
  grade: string;
}

interface FreeSegment {
  date: string;
  day: Day;
  start: string;
  end: string;
}

const TIMELINE_HEIGHT = 620;
const MINUTES_GUTTER = 30;

function toMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function fromMinutes(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

function toIsoDate(value: Date): string {
  return value.toISOString().split("T")[0];
}

function addDays(base: Date, amount: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + amount);
  return next;
}

function getStartOfWeekMonday(reference: Date): Date {
  const date = new Date(reference);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDateLabel(date: Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
  }).format(date);
}

export function AdminReservationPlanner() {
  const [selectedRoom, setSelectedRoom] = useState<Slot["room"]>(ROOMS[0]);
  const [weekStart, setWeekStart] = useState<Date>(getStartOfWeekMonday(new Date()));
  const [reservations, setReservations] = useState<ManualReservation[]>([]);
  const [activeSegment, setActiveSegment] = useState<FreeSegment | null>(null);
  const [reserveMode, setReserveMode] = useState<ReserveMode>("full");
  const [reservedBy, setReservedBy] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [formError, setFormError] = useState("");

  const weekDays = useMemo(
    () =>
      DAYS.map((day, index) => {
        const date = addDays(weekStart, index);
        return { day, date, dateIso: toIsoDate(date), label: formatDateLabel(date) };
      }),
    [weekStart],
  );

  const roomTemplateSlots = useMemo(
    () => slots.filter((slot) => slot.room === selectedRoom && slot.status === "fixed"),
    [selectedRoom],
  );

  const minStart = useMemo(
    () => Math.min(...roomTemplateSlots.map((slot) => toMinutes(slot.start))),
    [roomTemplateSlots],
  );
  const maxEnd = useMemo(
    () => Math.max(...roomTemplateSlots.map((slot) => toMinutes(slot.end))),
    [roomTemplateSlots],
  );
  const totalMinutes = maxEnd - minStart + MINUTES_GUTTER;

  function closeModal(): void {
    setActiveSegment(null);
    setReserveMode("full");
    setReservedBy("");
    setSubject("");
    setGrade("");
    setCustomStart("");
    setCustomEnd("");
    setFormError("");
  }

  function openSegment(segment: FreeSegment): void {
    setActiveSegment(segment);
    setReserveMode("full");
    setCustomStart(segment.start);
    setCustomEnd(segment.end);
    setFormError("");
  }

  function createReservation(): void {
    if (!activeSegment) return;

    if (!reservedBy.trim() || !subject.trim() || !grade.trim()) {
      setFormError("Completa nombre, asignatura y grado.");
      return;
    }

    const start = reserveMode === "full" ? activeSegment.start : customStart;
    const end = reserveMode === "full" ? activeSegment.end : customEnd;

    if (!start || !end) {
      setFormError("Debes elegir una franja valida.");
      return;
    }

    const startMinutes = toMinutes(start);
    const endMinutes = toMinutes(end);
    const segmentStart = toMinutes(activeSegment.start);
    const segmentEnd = toMinutes(activeSegment.end);

    if (startMinutes >= endMinutes) {
      setFormError("La hora de inicio debe ser menor que la de fin.");
      return;
    }

    if (startMinutes < segmentStart || endMinutes > segmentEnd) {
      setFormError("El rango debe estar dentro del hueco seleccionado.");
      return;
    }

    const reservation: ManualReservation = {
      id: `r-${Date.now()}`,
      room: selectedRoom,
      date: activeSegment.date,
      day: activeSegment.day,
      start,
      end,
      reservedBy: reservedBy.trim(),
      subject: subject.trim(),
      grade: grade.trim(),
    };

    setReservations((previous) => [...previous, reservation]);
    closeModal();
  }

  return (
    <section className="space-y-4">
      <div className="brand-card rounded-lg p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="room-select-admin" className="mb-2 block text-sm font-semibold text-[#8f1530]">
              Salon
            </label>
            <select
              id="room-select-admin"
              value={selectedRoom}
              onChange={(event) => setSelectedRoom(event.target.value as Slot["room"])}
              className="w-64 rounded-md border border-[#d8b7c0] bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#b21a3a] focus:ring-2 focus:ring-[#f3c6d3]"
            >
              {ROOMS.map((room) => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setWeekStart(getStartOfWeekMonday(new Date()))}
              className="rounded-md border border-[#d8b7c0] bg-white px-3 py-2 text-sm text-slate-700 hover:bg-[#fff7f9]"
            >
              Semana actual
            </button>
            <button
              type="button"
              onClick={() => setWeekStart(getStartOfWeekMonday(addDays(new Date(), 7)))}
              className="rounded-md border border-[#d8b7c0] bg-white px-3 py-2 text-sm text-slate-700 hover:bg-[#fff7f9]"
            >
              Semana siguiente
            </button>
            <button
              type="button"
              onClick={() => setWeekStart(getStartOfWeekMonday(addDays(new Date(), 14)))}
              className="rounded-md border border-[#d8b7c0] bg-white px-3 py-2 text-sm text-slate-700 hover:bg-[#fff7f9]"
            >
              En dos semanas
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#d8b7c0] bg-white shadow-sm">
        <table className="min-w-[1000px] w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#f8e8ed]">
              {weekDays.map((item) => (
                <th key={item.dateIso} className="border border-[#d8b7c0] p-2 text-center text-[#8f1530]">
                  <p>{item.day}</p>
                  <p className="text-xs font-normal text-slate-600">{item.label}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {weekDays.map((item) => {
                const baseBlocks = roomTemplateSlots
                  .filter((slot) => slot.day === item.day)
                  .map((slot) => ({
                    id: slot.id,
                    start: slot.start,
                    end: slot.end,
                    title: slot.subject,
                    grade: slot.course,
                    by: slot.teacher,
                    kind: "fixed" as const,
                  }));

                const dateReservations = reservations
                  .filter((reservation) => reservation.room === selectedRoom && reservation.date === item.dateIso)
                  .map((reservation) => ({
                    id: reservation.id,
                    start: reservation.start,
                    end: reservation.end,
                    title: reservation.subject,
                    grade: reservation.grade,
                    by: reservation.reservedBy,
                    kind: "reserved" as const,
                  }));

                const blocks = [...baseBlocks, ...dateReservations].sort(
                  (a, b) => toMinutes(a.start) - toMinutes(b.start),
                );

                const freeSegments: FreeSegment[] = [];
                let pointer = minStart;
                blocks.forEach((block) => {
                  const start = toMinutes(block.start);
                  const end = toMinutes(block.end);

                  if (start > pointer) {
                    freeSegments.push({
                      date: item.dateIso,
                      day: item.day,
                      start: fromMinutes(pointer),
                      end: fromMinutes(start),
                    });
                  }

                  pointer = Math.max(pointer, end);
                });

                if (pointer < maxEnd) {
                  freeSegments.push({
                    date: item.dateIso,
                    day: item.day,
                    start: fromMinutes(pointer),
                    end: fromMinutes(maxEnd),
                  });
                }

                return (
                  <td key={item.dateIso} className="border border-[#d8b7c0] bg-white align-top">
                    <div className="relative" style={{ height: `${TIMELINE_HEIGHT}px` }}>
                      {freeSegments.map((segment, index) => {
                        const start = toMinutes(segment.start);
                        const end = toMinutes(segment.end);
                        const top = Math.round(((start - minStart) / totalMinutes) * TIMELINE_HEIGHT);
                        const height = Math.max(34, Math.round(((end - start) / totalMinutes) * TIMELINE_HEIGHT));

                        return (
                          <button
                            key={`${segment.date}-${segment.start}-${segment.end}-${index}`}
                            type="button"
                            onClick={() => openSegment(segment)}
                            className="absolute left-0.5 right-0.5 rounded border border-dashed border-[#d8b7c0] bg-white/70 text-left hover:border-[#b21a3a] hover:bg-[#fff7f9]"
                            style={{ top: `${top}px`, height: `${height}px` }}
                            title={`Reservar ${segment.start}-${segment.end}`}
                          >
                            <span className="pl-2 text-[11px] text-slate-400">+ Reservar</span>
                          </button>
                        );
                      })}

                      {blocks.map((block) => {
                        const start = toMinutes(block.start);
                        const end = toMinutes(block.end);
                        const top = Math.round(((start - minStart) / totalMinutes) * TIMELINE_HEIGHT);
                        const height = Math.max(42, Math.round(((end - start) / totalMinutes) * TIMELINE_HEIGHT));
                        const compact = end - start <= 55;

                        return (
                          <article
                            key={block.id}
                            className={`absolute left-0.5 right-0.5 overflow-hidden rounded border p-1.5 ${
                              block.kind === "fixed"
                                ? "border-zinc-500 bg-[#d7d9b3] text-slate-900"
                                : "border-[#8f1530] bg-[#f8dce4] text-slate-900"
                            }`}
                            style={{ top: `${top}px`, height: `${height}px` }}
                            title={`${block.title} - ${block.grade} - ${block.by}`}
                          >
                            <p className="text-[11px] leading-none text-right text-slate-700">
                              {block.start}/{block.end}
                            </p>
                            <p className={`mt-1 font-semibold leading-tight ${compact ? "text-base" : "text-lg"}`}>
                              {block.title}
                            </p>
                            <p className="truncate text-xs">{block.grade}</p>
                            {!compact && <p className="truncate text-[10px]">{block.by}</p>}
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

      <div className="brand-card rounded-lg p-4 shadow-sm">
        <h3 className="brand-title text-lg font-semibold">Reservas creadas en esta semana</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {reservations.filter((reservation) => reservation.room === selectedRoom).length === 0 ? (
            <li className="brand-copy">Aun no hay reservas manuales para este salon.</li>
          ) : (
            reservations
              .filter((reservation) => reservation.room === selectedRoom)
              .map((reservation) => (
                <li key={reservation.id} className="rounded border border-[#d8b7c0] bg-[#fff7f9] p-2 text-slate-800">
                  {reservation.day} {reservation.date} - {reservation.start}-{reservation.end} - {reservation.subject} (
                  {reservation.grade}) - {reservation.reservedBy}
                </li>
              ))
          )}
        </ul>
      </div>

      {activeSegment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-lg border border-[#d8b7c0] bg-white p-5 shadow-xl">
            <h3 className="text-lg font-bold text-[#8f1530]">Nueva reserva</h3>
            <p className="mt-1 text-sm text-slate-600">
              {activeSegment.day} {activeSegment.date} - Hueco: {activeSegment.start} a {activeSegment.end}
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label htmlFor="reserved-by" className="mb-1 block text-sm font-medium text-slate-700">
                  Nombre de quien reserva
                </label>
                <input
                  id="reserved-by"
                  value={reservedBy}
                  onChange={(event) => setReservedBy(event.target.value)}
                  className="w-full rounded border border-[#d8b7c0] px-3 py-2 text-sm outline-none focus:border-[#b21a3a]"
                  placeholder="Ej: Maria Gomez"
                />
              </div>
              <div>
                <label htmlFor="reserved-subject" className="mb-1 block text-sm font-medium text-slate-700">
                  Asignatura
                </label>
                <input
                  id="reserved-subject"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  className="w-full rounded border border-[#d8b7c0] px-3 py-2 text-sm outline-none focus:border-[#b21a3a]"
                  placeholder="Ej: Ciencias Naturales"
                />
              </div>
              <div>
                <label htmlFor="reserved-grade" className="mb-1 block text-sm font-medium text-slate-700">
                  Grado
                </label>
                <input
                  id="reserved-grade"
                  value={grade}
                  onChange={(event) => setGrade(event.target.value)}
                  className="w-full rounded border border-[#d8b7c0] px-3 py-2 text-sm outline-none focus:border-[#b21a3a]"
                  placeholder="Ej: 7.1"
                />
              </div>

              <div>
                <label htmlFor="reserve-mode" className="mb-1 block text-sm font-medium text-slate-700">
                  Tipo de franja
                </label>
                <select
                  id="reserve-mode"
                  value={reserveMode}
                  onChange={(event) => setReserveMode(event.target.value as ReserveMode)}
                  className="w-full rounded border border-[#d8b7c0] px-3 py-2 text-sm outline-none focus:border-[#b21a3a]"
                >
                  <option value="full">Todo el hueco ({activeSegment.start}-{activeSegment.end})</option>
                  <option value="custom">Rango personalizado</option>
                </select>
              </div>

              {reserveMode === "custom" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="custom-start" className="mb-1 block text-sm font-medium text-slate-700">
                      Hora inicio
                    </label>
                    <input
                      id="custom-start"
                      type="time"
                      value={customStart}
                      min={activeSegment.start}
                      max={activeSegment.end}
                      onChange={(event) => setCustomStart(event.target.value)}
                      className="w-full rounded border border-[#d8b7c0] px-3 py-2 text-sm outline-none focus:border-[#b21a3a]"
                    />
                  </div>
                  <div>
                    <label htmlFor="custom-end" className="mb-1 block text-sm font-medium text-slate-700">
                      Hora fin
                    </label>
                    <input
                      id="custom-end"
                      type="time"
                      value={customEnd}
                      min={activeSegment.start}
                      max={activeSegment.end}
                      onChange={(event) => setCustomEnd(event.target.value)}
                      className="w-full rounded border border-[#d8b7c0] px-3 py-2 text-sm outline-none focus:border-[#b21a3a]"
                    />
                  </div>
                </div>
              )}

              {formError && <p className="text-sm text-red-700">{formError}</p>}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="rounded border border-[#d8b7c0] px-3 py-2 text-sm text-slate-700 hover:bg-[#fff7f9]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={createReservation}
                className="rounded bg-[#b21a3a] px-3 py-2 text-sm font-medium text-white hover:bg-[#8f1530]"
              >
                Guardar reserva
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
