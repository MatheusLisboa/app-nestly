import type { Metadata, Viewport } from "next";
import { Geist_Mono, Nunito } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { brand } from "@/config/brand";
import { AppProviders } from "@/features/shared/components/providers/app-providers";
import "@/styles/globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: brand.name,
    template: `%s · ${brand.name}`,
  },
  description: brand.description,
  applicationName: brand.name,
  metadataBase: new URL(brand.url),
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: brand.assets.favicon, sizes: "32x32", type: "image/png" },
      { url: brand.assets.logoMark, type: "image/svg+xml" },
      { url: brand.assets.icon192, sizes: "192x192", type: "image/png" },
      { url: brand.assets.icon512, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: brand.assets.appleTouchIcon, sizes: "180x180", type: "image/png" }],
    shortcut: brand.assets.favicon,
  },
  openGraph: {
    title: brand.name,
    description: brand.description,
    siteName: brand.name,
    type: "website",
    locale: "pt_BR",
    images: [
      {
        url: brand.assets.ogImage,
        width: 1200,
        height: 630,
        alt: brand.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: brand.name,
    description: brand.description,
    images: [brand.assets.ogImage],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: brand.name,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: brand.themeColor.light },
    { media: "(prefers-color-scheme: dark)", color: brand.themeColor.dark },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  colorScheme: "light dark",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${nunito.variable} ${geistMono.variable}`}>
        <NextIntlClientProvider messages={messages}>
          <AppProviders>{children}</AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
