import type { Metadata } from "next";
import { Libre_Caslon_Display, Libre_Franklin } from "next/font/google";
import "./globals.css";

const libreCaslon = Libre_Caslon_Display({
  subsets: ["latin", "latin-ext"],
  weight: ["400"],
  variable: "--font-libre-caslon",
  display: "swap",
});

const libreFranklin = Libre_Franklin({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-libre-franklin",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Puskin and Partners | Development, Rekonstrukce, Reality, Investice",
    template: "%s | Puskin and Partners",
  },
  description:
    "Puskin and Partners — 20+ let ve stavebnictví, od roku 2023 investiční společnost. Development, rekonstrukce a investice v Praze.",
  metadataBase: new URL("https://puskinandpartners.cz"),
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    siteName: "Puskin and Partners",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <body className={`${libreCaslon.variable} ${libreFranklin.variable} font-body`}>{children}</body>
    </html>
  );
}
