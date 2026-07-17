"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, UtensilsCrossed } from "lucide-react";
import Sidebar from "@/components/sidebar";

export default function DashboardShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex h-14 items-center gap-3 border-b border-border bg-surface px-4 md:hidden">
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg p-1.5 text-muted transition hover:bg-surface-hover hover:text-white"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <UtensilsCrossed className="h-5 w-5 text-gold" />
        <span className="text-base font-semibold text-white">
          Sushi <span className="text-gold">Point</span>
        </span>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <Sidebar userEmail={userEmail} open={open} onClose={() => setOpen(false)} />

      <main className="flex-1 p-6 pt-6 lg:p-8">{children}</main>
    </div>
  );
}
