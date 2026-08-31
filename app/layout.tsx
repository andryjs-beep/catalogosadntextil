import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ADN Textil y Estampados | Catálogo Digital Oficial",
    template: "%s | ADN Textil",
  },
  description: "Catálogo digital oficial de ADN Textil y Estampados. Explora franelas, estampados personalizados, ropa deportiva y confección textil de alta calidad con atención directa por WhatsApp.",
  keywords: ["ADN Textil", "Estampados", "Franelas", "Confección Textil", "Catálogo Digital", "Sublimación", "Serigrafía", "Uniformes"],
  authors: [{ name: "ADN Textil y Estampados" }],
  creator: "ADN Textil",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://adntextil.catalogo.dpdns.org"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_VE",
    url: "https://adntextil.catalogo.dpdns.org",
    title: "ADN Textil y Estampados | Catálogo Digital Oficial",
    description: "Conoce todas nuestras colecciones textiles, franelas y estampados con atención directa por WhatsApp.",
    siteName: "ADN Textil y Estampados",
  },
  twitter: {
    card: "summary_large_image",
    title: "ADN Textil y Estampados | Catálogo Digital Oficial",
    description: "Catálogo digital oficial de ADN Textil y Estampados.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
