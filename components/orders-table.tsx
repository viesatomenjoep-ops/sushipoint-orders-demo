"use client";

import { useState } from "react";
import { Eye, PackageOpen, Trash2 } from "lucide-react";
import type { Order } from "@/lib/types";
import OrderDetailModal from "./order-detail-modal";
import { deleteOrder } from "@/app/dashboard/actions";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("nl-NL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export default function OrdersTable({ orders }: { orders: Order[] }) {
  const [selected, setSelected] = useState<Order | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(order: Order) {
    if (!confirm(`Bestelling van ${order.naam} verwijderen? Dit kan niet ongedaan worden gemaakt.`)) {
      return;
    }

    setDeletingId(order.id);
    try {
      await deleteOrder(order.id);
      if (selected?.id === order.id) {
        setSelected(null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Verwijderen mislukt");
    } finally {
      setDeletingId(null);
    }
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface py-20 text-center">
        <PackageOpen className="mb-3 h-8 w-8 text-muted" />
        <p className="text-sm text-muted">Nog geen bestellingen.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <p className="font-medium text-white">{order.naam}</p>
              <p className="whitespace-nowrap font-medium text-gold">
                {formatPrice(order.totaalprijs)}
              </p>
            </div>

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted">Telefoon</span>
                <span className="text-white">{order.telefoonnummer}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted">Bezorging</span>
                <span className="text-white">{order.bezorgmethode}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted">Betaling</span>
                <span className="text-white">{order.betaalmethode}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted">Besteld op</span>
                <span className="text-white">
                  {formatDate(order.created_at)}
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
              <button
                onClick={() => setSelected(order)}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-gold transition hover:border-gold"
              >
                <Eye className="h-3.5 w-3.5" />
                Bekijk
              </button>
              <button
                onClick={() => handleDelete(order)}
                disabled={deletingId === order.id}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-red-400 transition hover:border-red-500 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {deletingId === order.id ? "…" : "Verwijder"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium">Naam</th>
              <th className="px-4 py-3 font-medium">Telefoon</th>
              <th className="px-4 py-3 font-medium">Bezorging</th>
              <th className="px-4 py-3 font-medium">Betaling</th>
              <th className="px-4 py-3 font-medium">Totaal</th>
              <th className="px-4 py-3 font-medium">Besteld op</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-border/60 text-white transition last:border-0 hover:bg-surface-hover"
              >
                <td className="px-4 py-3 font-medium">{order.naam}</td>
                <td className="px-4 py-3 text-muted">
                  {order.telefoonnummer}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
                    {order.bezorgmethode}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
                    {order.betaalmethode}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-gold">
                  {formatPrice(order.totaalprijs)}
                </td>
                <td className="px-4 py-3 text-muted">
                  {formatDate(order.created_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setSelected(order)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-gold transition hover:border-gold"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Bekijk
                    </button>
                    <button
                      onClick={() => handleDelete(order)}
                      disabled={deletingId === order.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-red-400 transition hover:border-red-500 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {deletingId === order.id ? "…" : "Verwijder"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <OrderDetailModal order={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
