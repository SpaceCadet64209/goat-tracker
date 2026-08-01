import type { Metadata, Viewport } from "next";

import "./globals.css";

export const metadata: Metadata = {
  applicationName: "GoatTrack",
  title: {
    default: "GoatTrack",
    template: "%s | GoatTrack",
  },
  description: "Secure, farm-focused goat management.",
  formatDetection: { telephone: false },
  icons: { icon: "/icon.svg", apple: "/apple-touch-icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#198f4b",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-ZA" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
