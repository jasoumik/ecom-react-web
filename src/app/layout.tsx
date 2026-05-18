import "./globals.css";
import type { Metadata } from "next";
import { Cormorant, Plus_Jakarta_Sans } from "next/font/google";
import { LayoutContent } from "@/components/layout/LayoutContent";

// Ultra-luxury editorial serif — high contrast, elegant, beauty editorial
const cormorant = Cormorant({
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});

// #1 Gen Z DTC body font — warm, rounded, modern (Ceremonia, Versed, Kosas)
const jakarta = Plus_Jakarta_Sans({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://replantglow.com'), // Replace with actual domain
  title: {
    default: "Replant Glow | Premium Skincare",
    template: "%s | Replant Glow"
  },
  description: "Premium skincare products for glowing, healthy skin. Discover serums, moisturizers, cleansers and more — curated for every skin type.",
  keywords: ["skincare", "skin care", "serum", "moisturizer", "cleanser", "glow", "beauty", "bangladesh", "online shopping", "cosmetics"],
  authors: [{ name: "Replant Glow" }],
  creator: "Replant Glow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://replantglow.com",
    title: "Replant Glow | Premium Skincare",
    description: "Premium skincare for glowing, healthy skin",
    siteName: "Replant Glow",
    images: [
      {
        url: "/replantglow.png", // Ensure this image exists in public folder
        width: 1200,
        height: 630,
        alt: "Replant Glow",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Replant Glow | Premium Skincare",
    description: "Premium skincare for glowing, healthy skin",
    images: ["/replantglow.png"],
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
        className={`${cormorant.variable} ${jakarta.variable} font-sans antialiased bg-background text-foreground min-h-screen`}
      >
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}
