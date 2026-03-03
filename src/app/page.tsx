import Link from "next/link";
import { RoomScheduleSelector } from "@/components/room-schedule-selector";

export default function Home() {
  return (
    <main className="min-h-screen p-6 font-sans">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="brand-card rounded-lg p-4 shadow-sm">
          <h1 className="brand-title text-2xl font-bold">Gestion de Salones y Horarios</h1>
          <p className="brand-copy mt-1 text-sm">
            Vista publica sin login: consulta disponibilidad y detecta huecos libres (en blanco).
          </p>
          <div className="mt-3">
            <Link
              href="/admin"
              className="brand-button inline-flex rounded-md border border-[#8f1530] px-3 py-2 text-sm font-medium transition-colors"
            >
              Ir a gestion de admin unico
            </Link>
          </div>
        </header>

        <RoomScheduleSelector />
      </div>
    </main>
  );
}
