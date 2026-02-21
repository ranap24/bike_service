import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BikeService – Your ride, your way.",
  description: "Book bike, auto, and car rides instantly. Fast, safe, affordable.",
  keywords: ["bike service", "ride booking", "bike taxi", "auto rickshaw"],
  openGraph: {
    title: "BikeService",
    description: "Your ride, your way.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased`}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
