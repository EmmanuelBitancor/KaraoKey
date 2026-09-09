import type { Metadata } from "next";
import "./globals.css";
import { TvNavigationProvider } from "@/components/TvNavigationProvider";

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
        <TvNavigationProvider>{children}</TvNavigationProvider>
        <style dangerouslySetInnerHTML={{__html: `
          *, *::before, *::after {
            outline: none !important;
            box-shadow: none !important;
          }
          input:focus, input:focus-visible,
          textarea:focus, textarea:focus-visible,
          select:focus, select:focus-visible,
          button:focus, button:focus-visible,
          a:focus, a:focus-visible,
          [tabindex]:focus, [tabindex]:focus-visible,
          [role="button"]:focus, [role="button"]:focus-visible {
            outline: none !important;
            box-shadow: none !important;
            border-color: transparent !important;
          }
          input::-webkit-focus-inner,
          button::-webkit-focus-inner,
          textarea::-webkit-focus-inner,
          select::-webkit-focus-inner {
            outline: none !important;
            border: none !important;
            box-shadow: none !important;
          }
        `}} />
      </body>
    </html>
  );
}
