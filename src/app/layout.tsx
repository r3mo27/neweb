import type { Metadata, Viewport } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import { contact } from "@/lib/data";
import { siteDescription, siteTitle, siteUrl } from "@/lib/site";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  authors: [{ name: contact.name, url: contact.linkedin }],
  keywords: [
    "Rubén Remacha",
    "web developer Zaragoza",
    "desarrollador web Zaragoza",
    "backend Java",
    "Spring Boot",
    "Next.js",
    "portfolio",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "es_ES",
    url: "/",
    siteName: "rem0",
    title: siteTitle,
    description: siteDescription,
  },
  twitter: { card: "summary_large_image", title: siteTitle, description: siteDescription },
};

export const viewport: Viewport = {
  themeColor: "#2536d8",
  colorScheme: "light",
};

/** Datos estructurados para buscadores: quién soy y dónde encontrarme. */
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: contact.name,
  url: siteUrl,
  email: `mailto:${contact.email}`,
  jobTitle: "Full-stack developer",
  address: { "@type": "PostalAddress", addressLocality: "Zaragoza", addressCountry: "ES" },
  sameAs: [contact.linkedin, contact.github],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${inter.variable} ${jetbrains.variable} antialiased`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
