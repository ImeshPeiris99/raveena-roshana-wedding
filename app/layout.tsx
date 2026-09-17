import type { Metadata } from "next";
import { Cormorant_Garamond, Great_Vibes, Manrope } from "next/font/google";
import "./globals.css";
import { MusicProvider } from "@/components/audio/MusicProvider";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
});

const script = Great_Vibes({
  subsets: ["latin"],
  variable: "--font-script",
  weight: "400",
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Raveena & Roshana | Wedding Invitation",
  description: "You are warmly invited to celebrate the wedding of Raveena and Roshana on 21st October 2026.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${serif.variable} ${script.variable} ${sans.variable}`}>
        <MusicProvider>{children}</MusicProvider>
      </body>
    </html>
  );
}
