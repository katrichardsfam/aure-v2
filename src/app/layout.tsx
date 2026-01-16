// src/app/layout.tsx
import { Providers } from "@/components/providers";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "aurë — Dress Your Presence",
  description: "Scent is the final layer of getting dressed.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`} data-scroll-behavior="smooth">
      <body className="font-sans antialiased bg-stone-50 text-stone-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
