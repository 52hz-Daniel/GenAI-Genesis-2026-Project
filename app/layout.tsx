import type { Metadata } from "next";
import localFont from "next/font/local";
import { Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ConsentBanner } from "@/components/analytics/ConsentBanner";
import { AnalyticsGate } from "@/components/analytics/AnalyticsGate";
import { Header } from "@/components/Header";
import { DemoModeBanner } from "@/components/demo/DemoModeBanner";
import { DemoTourOverlay } from "@/components/demo/DemoTourOverlay";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { Suspense } from "react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aptitude AI | Your career companion",
  description:
    "Resume bullets and interview practice that remember you. Built for students. First win in under 60 seconds.",
  openGraph: {
    title: "Aptitude AI | Your career companion",
    description:
      "Resume bullets and interview practice that remember you. Built for students. First win in under 60 seconds.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aptitude AI | Your career companion",
    description:
      "Resume bullets and interview practice that remember you. Built for students. First win in under 60 seconds.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${sourceSerif.variable} antialiased min-h-screen flex flex-col`}>
        <ThemeProvider>
          <SessionProvider>
            <AnalyticsGate>
              <Header />
              <DemoModeBanner />
              <main className="flex-1">{children}</main>
              <Suspense fallback={null}>
                <DemoTourOverlay />
              </Suspense>
              <ConsentBanner />
            </AnalyticsGate>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
