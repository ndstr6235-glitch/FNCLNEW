import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Puskin and Partners | Development, Rekonstrukce, Reality, Investice",
    template: "%s | Puskin and Partners",
  },
  description:
    "Puskin and Partners — prémiový development, rekonstrukce, realitní služby a investice v Praze. 20+ let zkušeností.",
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
      <body>{children}</body>
    </html>
  );
}
