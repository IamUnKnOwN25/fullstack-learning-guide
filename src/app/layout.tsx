import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { NavigationHud } from "@/components/NavigationHud";
import { CyberCompanionByte } from "@/components/CyberCompanionByte";
import { NetworkStatusIndicator } from "@/components/NetworkStatusIndicator";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "DevQuest: The Web Matrix Chronicles",
  description: "Learn Full-Stack Web Development through an interactive RPG quest adventure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${jakartaSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-matrix-dark text-slate-100 font-sans min-h-screen flex flex-col bg-cyber-grid antialiased selection:bg-matrix-neonCyan/30 selection:text-white">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-cyan-500 focus:text-slate-950 focus:font-bold focus:rounded-md focus:shadow-lg focus:outline-none">Skip to main content</a>
        <NavigationHud />
        <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col focus:outline-none">{children}</main>
        <CyberCompanionByte />
        <NetworkStatusIndicator />
      </body>
    </html>
  );
}
