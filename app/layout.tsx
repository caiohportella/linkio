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
  title: "Linkio",
  description: "All that you are, in one link.",
  icons: {
    icon: "/favicon.ico",
  },
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
          <ClerkProvider dynamic appearance={{ cssLayerName: "clerk" }}>
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </ClerkProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
