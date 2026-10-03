import type { Metadata } from "next";
import "./globals.css";
import "./cardora.css";
import "./joker-v2.css";

export const metadata: Metadata = {
  title: "JOKER — ითამაშე ჯოკერი ონლაინ",
  description: "ქართული ჯოკერის თანამედროვე, play-money ონლაინ გამოცდილება.",
  other: { "codex-preview": "development" },
  icons: { icon: "/favicon.jpg", shortcut: "/favicon.jpg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ka"><body>{children}</body></html>;
}
