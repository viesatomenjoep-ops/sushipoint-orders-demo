"use client";

import { useEffect } from "react";
import { X, MapPin, Phone, Truck, CreditCard } from "lucide-react";
import type { Order } from "@/lib/types";

function formatPrice(amount: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export default function OrderDetailModal({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-white">{order.naam}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted transition hover:bg-surface-hover hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="grid grid-cols-1 gap-2 text-sm text-muted sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-gold" />
              {order.telefoonnummer}
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <MapPin className="h-3.5 w-3.5 text-gold" />
              {order.adres}
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-3.5 w-3.5 text-gold" />
              {order.bezorgmethode}
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-3.5 w-3.5 text-gold" />
              {order.betaalmethode}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
              Producten
            </h3>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-background/40 text-xs text-muted">
                    <th className="px-3 py-2 text-left font-medium">
                      Product
                    </th>
                    <th className="px-3 py-2 text-right font-medium">
                      Aantal
                    </th>
                    <th className="px-3 py-2 text-right font-medium">
                      Prijs
                    </th>
                    <th className="px-3 py-2 text-right font-medium">
                      Subtotaal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.producten.map((item, i) => (
                    <tr
                      key={i}
                      className="border-b border-border/60 text-white last:border-0"
                    >
                      <td className="px-3 py-2">{item.naam}</td>
                      <td className="px-3 py-2 text-right text-muted">
                        {item.aantal}
                      </td>
                      <td className="px-3 py-2 text-right text-muted">
                        {formatPrice(item.prijs)}
                      </td>
                      <td className="px-3 py-2 text-right text-muted">
                        {formatPrice(item.prijs * item.aantal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border">
                    <td
                      colSpan={3}
                      className="px-3 py-2 text-sm font-medium text-white"
                    >
                      Totaal
                    </td>
                    <td className="px-3 py-2 text-right text-sm font-semibold text-gold">
                      {formatPrice(order.totaalprijs)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
