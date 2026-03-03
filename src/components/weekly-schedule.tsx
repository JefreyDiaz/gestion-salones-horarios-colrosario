"use client";

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

function getFixedColor(course: string): string {
  const hash = Array.from(course).reduce((acc, char) => acc + (char.codePointAt(0) ?? 0), 0);
  return BLOCK_COLORS[hash % BLOCK_COLORS.length];
}

function getSlotClass(slot: Slot): string {
  if (slot.status === "fixed") {
    return `${getFixedColor(slot.course)} border-zinc-500`;
  }

  return statusStyles[slot.status];
}

export function WeeklySchedule({ room, title }: Readonly<WeeklyScheduleProps>) {
  const roomSlots = slots
    .filter((slot) => slot.room === room)
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

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

      <div className="overflow-x-auto rounded-lg border border-[#d8b7c0] bg-white shadow-sm">
        <table className="min-w-[1000px] w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#f8e8ed]">
              {DAYS.map((day) => (
                <th key={day} className="border border-[#d8b7c0] p-2 text-center text-[#8f1530]">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {DAYS.map((day) => {
                const daySlots = roomSlots.filter((slot) => slot.day === day);

                return (
                  <td key={day} className="border border-[#d8b7c0] bg-white align-top">
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
                            className={`absolute left-0 right-0 m-0.5 overflow-hidden rounded border p-1.5 ${getSlotClass(slot)}`}
                            style={{ top: `${top}px`, height: `${height}px` }}
                            title={`${slot.subject} - ${slot.course} - ${slot.teacher} (${slot.start}-${slot.end})`}
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
                            {!isTinyBlock && <p className="truncate text-xs font-medium text-slate-800">{slot.course}</p>}
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
