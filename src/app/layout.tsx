import type { Metadata } from "next";
import { Playfair_Display, Raleway, Great_Vibes } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-raleway",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-great-vibes",
});

export const metadata: Metadata = {
  title: "Riwaaya Threads | Luxury Pakistani Couture & Ethnic Wear",
  description: "Discover handcrafted Pakistani suits, co-ord sets, and ethnic wear. Experience timeless South Asian heritage meets modern couture.",
  keywords: ["Pakistani Suits", "Co-ord Sets", "Ethnic Wear", "Lawn", "Chiffon", "Organza", "Bridal Couture", "Luxury Fashion", "Riwaaya"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${raleway.variable} ${greatVibes.variable}`}>
      <body>{children}</body>
    </html>
  );
}

