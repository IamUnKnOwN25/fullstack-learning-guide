import type { Metadata } from "next";
import "./globals.css";
import { NavigationHud } from "@/components/NavigationHud";
import { CyberCompanionByte } from "@/components/CyberCompanionByte";

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
    <html lang="en" className="dark">
      <body className="bg-matrix-dark text-gray-100 min-h-screen flex flex-col bg-cyber-grid antialiased">
        <NavigationHud />
        <main className="flex-1 flex flex-col">{children}</main>
        <CyberCompanionByte />
      </body>
    </html>
  );
}
