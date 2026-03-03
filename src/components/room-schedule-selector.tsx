"use client";

import { useMemo, useState } from "react";
import { WeeklySchedule } from "@/components/weekly-schedule";
import { ROOMS, type Slot } from "@/lib/schedule";

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

export function RoomScheduleSelector() {
  const [selectedRoom, setSelectedRoom] = useState<Slot["room"]>(ROOMS[0]);
  const [weekStart, setWeekStart] = useState<Date>(getStartOfWeekMonday(new Date()));

  const selectedTitle = useMemo(() => `Aula: ${selectedRoom}`, [selectedRoom]);

  return (
    <section className="space-y-4">
      <div className="brand-card rounded-lg p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="room-select" className="mb-2 block text-sm font-semibold text-[#8f1530]">
              Selecciona el salon a consultar
            </label>
            <select
              id="room-select"
              value={selectedRoom}
              onChange={(event) => setSelectedRoom(event.target.value as Slot["room"])}
              className="w-full max-w-sm rounded-md border border-[#d8b7c0] bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#b21a3a] focus:ring-2 focus:ring-[#f3c6d3]"
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

      <WeeklySchedule room={selectedRoom} title={selectedTitle} weekStart={weekStart} />
    </section>
  );
}
