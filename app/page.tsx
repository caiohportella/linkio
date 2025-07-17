import { AnimatedBackground } from "@/components/AnimatedBackground";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import Footer from "@/components/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import Navbar from "@/components/Navbar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

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
