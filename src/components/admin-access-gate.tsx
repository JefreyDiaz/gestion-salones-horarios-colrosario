"use client";

import { useState } from "react";

export function AdminAccessGate() {
  const [token, setToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function submitToken(event: { preventDefault: () => void }): Promise<void> {
    event.preventDefault();
    setErrorMessage("");

    if (!token.trim()) {
      setErrorMessage("Ingresa el token para continuar.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: token.trim() }),
      });

      const payload = (await response.json()) as {
        error?: {
          message?: string;
        };
      };

      if (!response.ok) {
        setErrorMessage(payload.error?.message ?? "No fue posible validar el token.");
        return;
      }

      globalThis.location.reload();
    } catch {
      setErrorMessage("No fue posible validar el token.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-xl space-y-6">
        <header className="brand-card rounded-lg p-4 shadow-sm">
          <h1 className="brand-title text-2xl font-bold">Acceso al panel admin</h1>
          <p className="brand-copy mt-1 text-sm">
            Este panel requiere token de acceso. Ingresa la clave para visualizar reservas y gestionarlas.
          </p>
        </header>

        <section className="brand-card rounded-lg p-4 shadow-sm">
          <form onSubmit={(event) => void submitToken(event)} className="space-y-3">
            <div>
              <label htmlFor="admin-access-token" className="mb-1 block text-sm font-medium text-slate-700">
                Token admin
              </label>
              <input
                id="admin-access-token"
                type="password"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                className="w-full rounded border border-[#d8b7c0] px-3 py-2 text-sm outline-none focus:border-[#b21a3a]"
                placeholder="ADMIN_PANEL_TOKEN"
              />
            </div>

            {errorMessage && <p className="text-sm text-red-700">{errorMessage}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded bg-[#b21a3a] px-3 py-2 text-sm font-medium text-white hover:bg-[#8f1530] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Validando..." : "Entrar al panel"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
