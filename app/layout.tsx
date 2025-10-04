import type { Metadata } from "next";
import { Ramabhadra } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/ThemeProvider"; // Import ThemeProvider

import { Toaster } from "@/components/ui/sonner";
// import { AnimatedBackground } from "@/components/AnimatedBackground";

const ramabhadra = Ramabhadra({
  weight: ["400"],
  variable: "--ramabhadra",
  subsets: [],
});

export const metadata: Metadata = {
  title: {
    default: "Linkio - All that you are, in one link",
    template: "%s | Linkio"
  },
  description: "Create your personalized link-in-bio page. Curate, organize, and share everything you want on your own page. Perfect for creators, influencers, and professionals.",
  keywords: [
    "link in bio",
    "linktree alternative", 
    "personal page",
    "social media links",
    "bio link",
    "creator tools",
    "influencer tools",
    "link management",
    "social links",
    "personal branding",
    "linkio",
    "link aggregator",
    "social media management"
  ],
  authors: [{ name: "Caio H.", url: "https://linkio.app.br" }],
  creator: "Linkio",
  publisher: "Linkio",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://linkio.app.br"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Linkio",
    title: "Linkio - All that you are, in one link",
    description: "Create your personalized link-in-bio page. Curate, organize, and share everything you want on your own page. Perfect for creators, influencers, and professionals.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Linkio - Personalized link-in-bio platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Linkio - All that you are, in one link",
    description: "Create your personalized link-in-bio page. Curate, organize, and share everything you want on your own page. Perfect for creators, influencers, and professionals.",
    images: ["/logo.png"],
    creator: "@linkio",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${ramabhadra.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider 
            dynamic 
            appearance={{ cssLayerName: "clerk" }}
            signInFallbackRedirectUrl="/dashboard"
            signUpFallbackRedirectUrl="/dashboard"
          >
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </ClerkProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
