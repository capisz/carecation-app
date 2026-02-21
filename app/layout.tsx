import React from "react";
import type { Metadata } from "next";
import { Poppins, Libre_Baskerville, IBM_Plex_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { OverlayProvider } from "@/components/overlay/overlay-provider";
import { NavOverlay } from "@/components/overlay/nav-overlay";
import { LoadingProvider } from "@/components/loading-provider";
import { LoadingOverlay } from "@/components/ecg-plane-animation";
import { SuppressWarnings } from "./suppress-warnings";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-libre-baskerville",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  title: "Carecation - Healthcare meets Adventure",
  description:
    "Plan your medical travel with confidence. Compare accredited providers, build itineraries, and get personalized carecation plans.",
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/brand/carecation-heart-light.png",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/brand/carecation-heart-dark.png",
      },
    ],
    shortcut: "/brand/carecation-heart-light.png",
    apple: "/brand/carecation-heart-light.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${libreBaskerville.variable} ${ibmPlexMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LoadingProvider>
            <LoadingOverlay />
            <SuppressWarnings />
            <OverlayProvider>
              <NavOverlay />
              {children}
            </OverlayProvider>
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
