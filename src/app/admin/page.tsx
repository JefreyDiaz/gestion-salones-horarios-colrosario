import Link from "next/link";
import { cookies } from "next/headers";
import { AdminAccessGate } from "@/components/admin-access-gate";
import { AdminReservationPlanner } from "@/components/admin-reservation-planner";

function hasAdminAccess(cookieStore: Awaited<ReturnType<typeof cookies>>): boolean {
  const expectedToken = process.env.ADMIN_PANEL_TOKEN;
  if (!expectedToken) {
    return false;
  }

  const cookieToken = cookieStore.get("admin_panel_session")?.value;
  return cookieToken === expectedToken;
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  if (!hasAdminAccess(cookieStore)) {
    return <AdminAccessGate />;
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="brand-card rounded-lg p-4 shadow-sm">
          <h1 className="brand-title text-2xl font-bold">Panel Admin Unico</h1>
          <p className="brand-copy mt-1 text-sm">
            Administra reservas por semana y por fecha real. Haz clic en un hueco en blanco para crear una reserva
            persistente.
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
