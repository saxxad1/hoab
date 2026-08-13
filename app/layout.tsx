import type { Metadata } from "next";
import { headers } from "next/headers";
import { Bebas_Neue, Montserrat } from "next/font/google";
import "./globals.css";

const heading = Bebas_Neue({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: "400",
});

const body = Montserrat({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const base = new URL(`${protocol}://${host}`);
  return {
    metadataBase: base,
    title: { default: "HOAB — Houseboat Owners Association of Bangladesh", template: "%s | HOAB" },
    description: "The official public registry and association platform for Bangladesh's houseboat tourism industry.",
    keywords: ["HOAB", "registered houseboat Bangladesh", "Tanguar Haor", "houseboat association"],
    openGraph: {
      title: "HOAB — The Voyage Together. The Heritage Forever.",
      description: "Explore verified houseboats and official HOAB information.",
      type: "website",
      url: base,
      locale: "en_BD",
      images: [{ url: new URL("/og.png", base).toString(), width: 1200, height: 630, alt: "Houseboat Owner's Association Bangladesh official logo" }],
    },
    twitter: { card: "summary_large_image", images: [new URL("/og.png", base).toString()] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body className={`${heading.variable} ${body.variable}`}>{children}</body></html>;
}
