import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Chatbot } from "@/components/chatbot";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "RugIntel - Rugpull Prediction for Solana",
  description:
    "AI-powered rugpull detection for Solana tokens. Protect your investments with intelligent risk assessment.",
  generator: "Rugintel",
  icons: {
    icon: "/rugintel-logo.png",
    apple: "/rugintel-icon.png",
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
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans antialiased dark bg-black text-white">
        {children}
        <Analytics />
        <Chatbot />
      </body>
    </html>
  );
}
