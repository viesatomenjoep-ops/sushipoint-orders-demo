"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, LogOut, UtensilsCrossed } from "lucide-react";
import { signOut } from "@/app/auth/actions";

const navItems = [
  { href: "/dashboard", label: "Bestellingen", icon: ClipboardList },
];

export default function Sidebar({
  userEmail,
  open,
  onClose,
}: {
  userEmail: string;
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-surface transition-transform duration-200 md:static md:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center gap-2 border-b border-border px-6 py-5">
        <UtensilsCrossed className="h-5 w-5 text-gold" />
        <span className="text-lg font-semibold text-white">
          Sushi <span className="text-gold">Point</span>
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                active
                  ? "bg-gold/10 text-gold"
                  : "text-muted hover:bg-surface-hover hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-3 py-4">
        <p className="mb-2 truncate px-3 text-xs text-muted">{userEmail}</p>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-surface-hover hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Uitloggen
          </button>
        </form>
      </div>
    </aside>
  );
}
