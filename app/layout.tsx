import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ConsentBanner } from "@/components/analytics/ConsentBanner";
import { Header } from "@/components/Header";
import { SessionProvider } from "@/components/auth/SessionProvider";

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

export const metadata: Metadata = {
  title: "Aptitude AI | Your career companion",
  description:
    "Translate your experiences into resume bullets and practice interviews with supportive AI. Built for students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <ThemeProvider>
          <SessionProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <ConsentBanner />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
