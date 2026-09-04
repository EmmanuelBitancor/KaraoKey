import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KaraoKey",
  description: "Search for a song and start singing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
