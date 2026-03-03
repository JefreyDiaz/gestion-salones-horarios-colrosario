import Link from "next/link";
import { AdminReservationPlanner } from "@/components/admin-reservation-planner";

export default function AdminPage() {
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="brand-card rounded-lg p-4 shadow-sm">
          <h1 className="brand-title text-2xl font-bold">Panel Admin Unico</h1>
          <p className="brand-copy mt-1 text-sm">
            Administra reservas por semana y por fecha real. Haz clic en un hueco en blanco para crear una reserva.
          </p>
          <Link href="/" className="brand-title mt-3 inline-flex text-sm hover:underline">
            Volver a vista publica
          </Link>
        </header>
        <AdminReservationPlanner />
      </div>
    </main>
  );
}
