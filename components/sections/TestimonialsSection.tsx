"use client";

import { motion } from "framer-motion";
import { SectionHeader } from "@/components/SectionHeader";

const testimonials = [
  {
    quote:
      "Linkio made it ridiculously easy to share all my content in one place. My clients love it!",
    name: "Juliana Rocha",
    title: "Digital Creator",
  },
  {
    quote:
      "Clean, fast and intuitive. I got my link live in under 2 minutes — it's perfect.",
    name: "Lucas Mendes",
    title: "Marketing Consultant",
  },
  {
    quote:
      "Way better than Linktree. The interface is beautiful and it just works.",
    name: "Ana Clara Dias",
    title: "Freelancer",
  },
];

export function TestimonialsSection() {
  return (
    <section className="relative z-10 w-full max-w-6xl px-4">
      <SectionHeader
        label="Testimonials"
        title="What people are saying"
        backgroundText="Feedback"
      />

      <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, index) => (
          <motion.div
            key={index}
            className="rounded-2xl bg-muted/30 p-6 shadow-md backdrop-blur-sm transition hover:shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-muted-foreground italic">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="mt-4">
              <p className="text-foreground font-semibold">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.title}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
