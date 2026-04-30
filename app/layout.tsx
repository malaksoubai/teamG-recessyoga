import type { Metadata } from "next";
import { League_Spartan, Poppins } from "next/font/google";
import { TRPCReactProvider } from "@/lib/trpc/provider";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "Recess Yoga Studio — Substitute requests",
  description: "Manage substitute teaching requests for Recess Yoga Studio.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Recess Yoga",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${leagueSpartan.variable}`}>
      <body className="antialiased">
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </body>
    </html>
  );
}
