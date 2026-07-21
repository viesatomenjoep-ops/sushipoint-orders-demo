"use client";

export default function ConfirmDialog({
  message,
  confirmLabel = "Verwijder",
  onConfirm,
  onCancel,
  busy = false,
}: {
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  busy?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-border bg-surface p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm text-white">{message}</p>

        <div className="mt-5 flex justify-end gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              disabled={busy}
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition hover:border-gold hover:text-white disabled:opacity-50"
            >
              Annuleer
            </button>
          )}
          <button
            onClick={onConfirm}
            disabled={busy}
            className="rounded-lg border border-red-500/60 bg-red-500/10 px-3 py-1.5 text-xs text-red-400 transition hover:border-red-500 disabled:opacity-50"
          >
            {busy ? "…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
