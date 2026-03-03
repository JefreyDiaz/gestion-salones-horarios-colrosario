export const DAYS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"] as const;

export type Day = (typeof DAYS)[number];

export type SlotStatus = "free" | "fixed" | "reserved" | "pending";

export interface Slot {
  id: string;
  day: Day;
  start: string;
  end: string;
  course: string;
  subject: string;
  teacher: string;
  room: "Sala Sistemas 1" | "Sala Sistemas 2";
  status: SlotStatus;
}

export const ROOMS: Slot["room"][] = ["Sala Sistemas 1", "Sala Sistemas 2"];

export const slots: Slot[] = [
  {
    id: "s1-1",
    day: "Lunes",
    start: "06:50",
    end: "08:40",
    course: "9.1",
    subject: "Tecnologia e Informatica",
    teacher: "Pineda Villada Alexis",
    room: "Sala Sistemas 1",
    status: "fixed",
  },
  {
    id: "s1-2",
    day: "Lunes",
    start: "08:40",
    end: "09:35",
    course: "8.1",
    subject: "Technology",
    teacher: "Pineda Villada Alexis",
    room: "Sala Sistemas 1",
    status: "fixed",
  },
  {
    id: "s1-3",
    day: "Lunes",
    start: "09:55",
    end: "11:45",
    course: "4.1",
    subject: "Technology",
    teacher: "Gaviria Gallego Paula Andrea",
    room: "Sala Sistemas 1",
    status: "fixed",
  },
  {
    id: "s1-4",
    day: "Lunes",
    start: "11:45",
    end: "12:40",
    course: "10.1",
    subject: "Tecnologia e Informatica",
    teacher: "Pineda Villada Alexis",
    room: "Sala Sistemas 1",
    status: "fixed",
  },
  {
    id: "s1-5",
    day: "Lunes",
    start: "13:20",
    end: "15:00",
    course: "3.1",
    subject: "Technology",
    teacher: "Gaviria Gallego Paula Andrea",
    room: "Sala Sistemas 1",
    status: "fixed",
  },
  {
    id: "s1-6",
    day: "Martes",
    start: "07:00",
    end: "08:40",
    course: "1.1",
    subject: "Technology",
    teacher: "Gaviria Gallego Paula Andrea",
    room: "Sala Sistemas 1",
    status: "fixed",
  },
  {
    id: "s1-7",
    day: "Martes",
    start: "08:40",
    end: "10:30",
    course: "9.2",
    subject: "Tecnologia e Informatica",
    teacher: "Pineda Villada Alexis",
    room: "Sala Sistemas 1",
    status: "fixed",
  },
  {
    id: "s1-8",
    day: "Martes",
    start: "10:50",
    end: "11:45",
    course: "6.1",
    subject: "Technology",
    teacher: "Pineda Villada Alexis",
    room: "Sala Sistemas 1",
    status: "fixed",
  },
  {
    id: "s1-9",
    day: "Martes",
    start: "13:20",
    end: "15:00",
    course: "2.2",
    subject: "Technology",
    teacher: "Sanchez Galvez Valeria",
    room: "Sala Sistemas 1",
    status: "fixed",
  },
  {
    id: "s1-10",
    day: "Miercoles",
    start: "07:00",
    end: "08:40",
    course: "2.1",
    subject: "Technology",
    teacher: "Sanchez Galvez Valeria",
    room: "Sala Sistemas 1",
    status: "fixed",
  },
  {
    id: "s1-11",
    day: "Miercoles",
    start: "10:00",
    end: "12:00",
    course: "3.2",
    subject: "Technology",
    teacher: "Gaviria Gallego Paula Andrea",
    room: "Sala Sistemas 1",
    status: "fixed",
  },
  {
    id: "s1-12",
    day: "Jueves",
    start: "07:45",
    end: "09:35",
    course: "5.1",
    subject: "Technology",
    teacher: "Pineda Villada Alexis",
    room: "Sala Sistemas 1",
    status: "fixed",
  },
  {
    id: "s1-13",
    day: "Jueves",
    start: "10:50",
    end: "11:45",
    course: "1.2",
    subject: "Technology",
    teacher: "Gaviria Gallego Paula Andrea",
    room: "Sala Sistemas 1",
    status: "fixed",
  },
  {
    id: "s1-14",
    day: "Jueves",
    start: "12:30",
    end: "13:20",
    course: "1.2",
    subject: "Technology",
    teacher: "Gaviria Gallego Paula Andrea",
    room: "Sala Sistemas 1",
    status: "fixed",
  },
  {
    id: "s1-15",
    day: "Jueves",
    start: "13:20",
    end: "15:00",
    course: "4.2",
    subject: "Technology",
    teacher: "Gaviria Gallego Paula Andrea",
    room: "Sala Sistemas 1",
    status: "fixed",
  },
  {
    id: "s1-16",
    day: "Viernes",
    start: "07:00",
    end: "08:40",
    course: "5.2",
    subject: "Technology",
    teacher: "Pineda Villada Alexis",
    room: "Sala Sistemas 1",
    status: "fixed",
  },
  {
    id: "s1-17",
    day: "Viernes",
    start: "10:20",
    end: "11:05",
    course: "8.2",
    subject: "Technology",
    teacher: "Pineda Villada Alexis",
    room: "Sala Sistemas 1",
    status: "fixed",
  },
  {
    id: "s1-18",
    day: "Viernes",
    start: "11:05",
    end: "11:50",
    course: "10.2",
    subject: "Tecnologia e Informatica",
    teacher: "Pineda Villada Alexis",
    room: "Sala Sistemas 1",
    status: "fixed",
  },
  {
    id: "s1-19",
    day: "Viernes",
    start: "11:50",
    end: "12:35",
    course: "11.1",
    subject: "Tecnologia e Informatica",
    teacher: "Pineda Villada Alexis",
    room: "Sala Sistemas 1",
    status: "fixed",
  },
  {
    id: "s1-20",
    day: "Viernes",
    start: "13:15",
    end: "14:00",
    course: "11.2",
    subject: "Tecnologia e Informatica",
    teacher: "Pineda Villada Alexis",
    room: "Sala Sistemas 1",
    status: "fixed",
  },
  {
    id: "s2-1",
    day: "Lunes",
    start: "12:30",
    end: "13:20",
    course: "Jardin, Transicion 1",
    subject: "Technology",
    teacher: "Gonzalez Alejandra Veronica",
    room: "Sala Sistemas 2",
    status: "fixed",
  },
  {
    id: "s2-2",
    day: "Martes",
    start: "08:40",
    end: "09:35",
    course: "5.1",
    subject: "English Laboratory",
    teacher: "Giraldo Palacio Leidy Vanesa",
    room: "Sala Sistemas 2",
    status: "fixed",
  },
  {
    id: "s2-3",
    day: "Martes",
    start: "10:50",
    end: "11:45",
    course: "4.2",
    subject: "English Laboratory",
    teacher: "Rodriguez Johana Andrea",
    room: "Sala Sistemas 2",
    status: "fixed",
  },
  {
    id: "s2-4",
    day: "Martes",
    start: "12:30",
    end: "13:20",
    course: "1.2",
    subject: "English Laboratory",
    teacher: "Giraldo Palacio Leidy Vanesa",
    room: "Sala Sistemas 2",
    status: "fixed",
  },
  {
    id: "s2-5",
    day: "Martes",
    start: "13:20",
    end: "14:15",
    course: "1.1",
    subject: "English Laboratory",
    teacher: "Giraldo Palacio Leidy Vanesa",
    room: "Sala Sistemas 2",
    status: "fixed",
  },
  {
    id: "s2-6",
    day: "Martes",
    start: "14:15",
    end: "15:00",
    course: "5.2",
    subject: "English Laboratory",
    teacher: "Giraldo Palacio Leidy Vanesa",
    room: "Sala Sistemas 2",
    status: "fixed",
  },
  {
    id: "s2-7",
    day: "Jueves",
    start: "12:30",
    end: "13:20",
    course: "3.2",
    subject: "English Laboratory",
    teacher: "Toro Valeria",
    room: "Sala Sistemas 2",
    status: "fixed",
  },
  {
    id: "s2-8",
    day: "Viernes",
    start: "07:45",
    end: "08:40",
    course: "2.2",
    subject: "English Laboratory",
    teacher: "Rodriguez Johana Andrea",
    room: "Sala Sistemas 2",
    status: "fixed",
  },
  {
    id: "s2-9",
    day: "Viernes",
    start: "13:15",
    end: "14:00",
    course: "3.1",
    subject: "English Laboratory",
    teacher: "Toro Valeria",
    room: "Sala Sistemas 2",
    status: "fixed",
  },
];

function toMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function compareRanges(a: string, b: string): number {
  const [aStart, aEnd] = a.split("-");
  const [bStart, bEnd] = b.split("-");

  const byStart = toMinutes(aStart) - toMinutes(bStart);
  if (byStart !== 0) {
    return byStart;
  }

  return toMinutes(aEnd) - toMinutes(bEnd);
}

export const HOURS: string[] = Array.from(
  new Set(slots.map((slot) => `${slot.start}-${slot.end}`)),
).sort(compareRanges);

export function toRangeLabel(start: string, end: string): string {
  return `${start}-${end}`;
}

export function findSlot(day: Day, hourRange: string, room: Slot["room"]): Slot | undefined {
  const [start, end] = hourRange.split("-");
  return slots.find(
    (slot) => slot.day === day && slot.start === start && slot.end === end && slot.room === room,
  );
}
