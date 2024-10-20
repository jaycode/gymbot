import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import Link from 'next/link';

import "./global.css";

// Font
const fontSans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const fontMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Daily Bots Demo",
  description: "Daily Bots voice-to-voice example app",
  metadataBase: new URL("https://demo.dailybots.ai"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fontSans.variable} ${fontMono.variable}`}>
        <main className="w-full flex items-center justify-center bg-primary-200 p-4 bg-[length:auto_50%] lg:bg-auto bg-colorWash bg-no-repeat bg-right-top">

          <nav>
            <Link href="/">Home</Link> | <Link href="/gym">Start Session</Link> | <Link href="/log">Gym Log</Link>
          </nav>
          {children}
        </main>
      </body>
    </html>
  );
}
