"use client";

import { useMemo, useState } from "react";
import { WeeklySchedule } from "@/components/weekly-schedule";
import { ROOMS, type Slot } from "@/lib/schedule";

export function RoomScheduleSelector() {
  const [selectedRoom, setSelectedRoom] = useState<Slot["room"]>(ROOMS[0]);

  const selectedTitle = useMemo(() => `Aula: ${selectedRoom}`, [selectedRoom]);

  return (
    <section className="space-y-4">
      <div className="brand-card rounded-lg p-4 shadow-sm">
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

      <WeeklySchedule room={selectedRoom} title={selectedTitle} />
    </section>
  );
}
