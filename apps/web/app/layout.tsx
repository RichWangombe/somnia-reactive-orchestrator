import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";

import "./globals.css";

import { Navbar } from "../components/Navbar";
import { Providers } from "./providers";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "ROP | Reactive Intent Rail",
  description: "Programmable on-chain automation for Somnia.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${headingFont.variable} ${monoFont.variable}`}>
      <body style={{ fontFamily: "var(--font-heading)" }}>
        <Providers>
          <div className="shell">
            <Navbar />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
