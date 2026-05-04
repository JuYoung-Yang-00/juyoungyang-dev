import type { Metadata } from "next";
import { JetBrains_Mono, Rubik } from "next/font/google";
import "./globals.css";

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Game-feel display + body font: rounded-geometric, plenty of weight range
const display = Rubik({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Ju Young Yang",
  description: "Ju Young (Justin) Yang — software engineer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${mono.variable} ${display.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
