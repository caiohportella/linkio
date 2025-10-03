"use client";

import { motion } from "framer-motion";
import {
  Zap,
  Link2,
  Smartphone,
  ShieldCheck,
  Palette,
  BarChart2,
  Globe,
  Settings,
} from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";

const features = [
  {
    title: "Instant Setup",
    description:
      "Create and share your link in under a minute. No fuss, no coding.",
    icon: Zap,
  },
  {
    title: "Unified Links",
    description:
      "Bring all your content together in one place — social, portfolio, store, and more.",
    icon: Link2,
  },
  {
    title: "Mobile Ready",
    description: "Responsive and fast. Your page looks great on every device.",
    icon: Smartphone,
  },
  {
    title: "Privacy & Security",
    description:
      "Your data is protected with industry-leading security and privacy standards.",
    icon: ShieldCheck,
  },
  {
    title: "Custom Branding",
    description: "Personalize your page with custom colors.",
    icon: Palette,
  },
  {
    title: "Analytics",
    description:
      "Track clicks and engagement with real-time analytics and insights.",
    icon: BarChart2,
  },
  {
    title: "Global Reach",
    description: "Optimized for fast loading and accessibility worldwide.",
    icon: Globe,
  },
  {
    title: "Easy Management",
    description: "Effortlessly update, reorder, or remove links anytime.",
    icon: Settings,
  },
];

export function FeaturesSection() {
  return (
    <section className="relative z-10 w-full max-w-6xl px-4">
      <SectionHeader
        label="Why Linkio"
        title="All your links in one place"
        backgroundText="Features"
      />

      <div className="mt-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ title, description, icon: Icon }, index) => (
          <motion.div
            key={title}
            className="rounded-2xl bg-muted/30 p-6 text-left shadow-md backdrop-blur-sm transition hover:shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15, duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <Icon className="mb-4 h-8 w-8 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
