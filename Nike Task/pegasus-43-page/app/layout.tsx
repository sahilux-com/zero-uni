import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// next/font ships a size-matched backup font, so text does not jump when Inter arrives.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nike Pegasus 43 · Black/White-Volt",
  description:
    "Nike Pegasus 43 road running shoe in Black/White-Volt. $140. Launches 10 December 2026.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="font-sans text-base leading-6">{children}</body>
    </html>
  );
}
