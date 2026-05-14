import "./globals.css";
import type { Metadata } from "next";
import { Lato } from "next/font/google";
import { LayoutContent } from "@/components/layout/LayoutContent";

const lato = Lato({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-lato",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://prithibee.com'), // Replace with actual domain
  title: {
    default: "Prithibee | Baby Care & Skin Care Products",
    template: "%s | Prithibee"
  },
  description: "Premium baby care and skin care products in Bangladesh. Shop for diapers, feeding essentials, clothing, toys, and authentic skin care items.",
  keywords: ["baby care", "skin care", "diapers", "baby food", "toys", "bangladesh", "online shopping", "cosmetics", "beauty"],
  authors: [{ name: "Prithibee" }],
  creator: "Prithibee",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://prithibee.com",
    title: "Prithibee | Baby Care & Skin Care Products",
    description: "Premium baby care and skin care products in Bangladesh",
    siteName: "Prithibee",
    images: [
      {
        url: "/prithibee.png", // Ensure this image exists in public folder
        width: 1200,
        height: 630,
        alt: "Prithibee",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prithibee | Baby Care & Skin Care Products",
    description: "Premium baby care and skin care products in Bangladesh",
    images: ["/prithibee.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo2.png",
  },
  // manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${lato.variable} font-sans bg-gradient-to-br from-sky-50 via-white to-sky-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 min-h-screen`}
      >
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}
