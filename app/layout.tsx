import type { Metadata } from "next";
import "./globals.css";
import VapiWidget from "@/components/vapi-widget";

export const metadata: Metadata = {
  title: "Sushi Point — Bestellingen",
  description: "Bestellingenbeheer voor Sushi Point",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className="bg-background text-white antialiased">
        {children}
        <VapiWidget />
      </body>
    </html>
  );
}
