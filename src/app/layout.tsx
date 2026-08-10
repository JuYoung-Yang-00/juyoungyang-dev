import type { Metadata, Viewport } from "next";
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
  metadataBase: new URL("https://juyoungyang.dev"),
  title: "Justin Yang — Software Engineer",
  description:
    "Ju Young (Justin) Yang's portfolio, playable as a tiny island world. Three islands — Education, Work, Projects — one knight, and the story behind the work.",
  openGraph: {
    title: "Justin Yang — Software Engineer",
    description:
      "A portfolio you can walk around: three floating islands — Education, Work, Projects — and the work behind them.",
    url: "https://juyoungyang.dev",
    siteName: "Justin Yang",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Justin Yang's island world portfolio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Justin Yang — Software Engineer",
    description:
      "A portfolio you can walk around: three floating islands — Education, Work, Projects — and the work behind them.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#a8dcef",
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
