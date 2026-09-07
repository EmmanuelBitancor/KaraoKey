import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KaraoKey - Sing like no one's watching",
  description: "Your lightweight karaoke companion, powered by YouTube.",
  icons: {
    icon: "/web-app-manifest-512x512.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased bg-[#0D0D0D] text-white">
        {children}
      </body>
    </html>
  );
}
