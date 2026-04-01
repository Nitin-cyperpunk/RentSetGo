import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";

import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "RentNest - Find Rental Homes in Nashik",
    template: "%s | RentNest",
  },
  description:
    "Find affordable flats, rooms, and houses for rent in Nashik. Browse 1BHK, 2BHK, and more with verified listings.",
  keywords: ["rent in nashik", "2bhk rent nashik", "flats in indra nagar", "rental homes"],
  openGraph: {
    title: "RentNest - Find Rental Homes in Nashik",
    description:
      "Find affordable flats, rooms, and houses for rent in Nashik. Browse 1BHK, 2BHK, and more with verified listings.",
    url: siteUrl,
    siteName: "RentNest",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
      suppressHydrationWarning
    >
      <body className="app-backdrop flex min-h-full flex-col font-sans text-foreground antialiased">
        <ThemeProvider>
          <ThemeToggle />
          <div className="flex min-h-full flex-1 flex-col pb-32 sm:pb-36">
            {children}
            <SiteFooter />
          </div>
          <Navbar />
        </ThemeProvider>
      </body>
    </html>
  );
}
