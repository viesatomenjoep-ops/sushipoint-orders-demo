"use client";

import { useState } from "react";
import { Phone, X } from "lucide-react";

const VAPI_WIDGET_URL =
  "https://vapi.ai?demo=true&shareKey=42adfea1-f491-4fdc-8458-a5862449eb40&assistantId=1f3782c7-f440-48bd-ac7d-387d1654f6f0";

export default function VapiWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="h-[70vh] max-h-[600px] w-[90vw] max-w-[380px] overflow-hidden rounded-xl border border-border bg-surface shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-medium text-white">
              Sushi <span className="text-gold">Point</span> Assistent
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Sluiten"
              className="rounded-lg p-1 text-muted transition hover:bg-surface-hover hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <iframe
            src={VAPI_WIDGET_URL}
            title="Sushi Point voice assistant"
            allow="microphone; autoplay"
            className="h-[calc(100%-49px)] w-full border-0"
          />
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Assistent sluiten" : "Assistent openen"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gold text-black shadow-xl transition hover:bg-gold-hover"
      >
        {open ? <X className="h-6 w-6" /> : <Phone className="h-6 w-6" />}
      </button>
    </div>
  );
}
