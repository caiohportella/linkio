import { AnimatedBackground } from "@/components/AnimatedBackground";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import Footer from "@/components/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import Navbar from "@/components/Navbar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getBaseUrl } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Linkio - All that you are, in one link";
  const description = "Create your personalized link-in-bio page. Curate, organize, and share everything you want on your own page. Perfect for creators, influencers, and professionals.";
  const imageUrl = `${getBaseUrl()}/logo.png`;

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: "Linkio - Personalized link-in-bio platform",
        },
      ],
      url: getBaseUrl(),
      siteName: "Linkio",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [imageUrl],
    },
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
      "personal branding"
    ],
    authors: [{ name: "Caio H." }],
    creator: "Linkio",
    publisher: "Linkio",
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
  };
}

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="relative overflow-hidden bg-background text-foreground">
      <AnimatedBackground />
      <Navbar />
      <div className="relative z-10 flex flex-col items-center gap-y-32 px-4 pb-32">
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        <Footer />
      </div>
    </main>
  );
}
