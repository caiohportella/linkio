"use client";

import { easeOut, motion } from "framer-motion";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
// import { useRouter } from "next/navigation";

const links = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
];

export function MobileMenu() {
  // const router = useRouter();

  return (
    <Sheet>
      <SheetContent
        side="top"
        className="h-screen w-screen p-0 bg-background/95 backdrop-blur-2xl flex flex-col items-center justify-center"
      >
        <SheetTitle className="hidden">Linkio</SheetTitle>

        <motion.div
          initial="hidden"
          animate="show"
          exit="hidden"
          variants={containerVariants}
          className="flex flex-col items-center gap-10"
        >
          {links.map((link) => (
            <motion.a
              key={link.href}
              href={link.href}
              variants={itemVariants}
              className="text-3xl font-semibold text-foreground hover:opacity-80 transition"
            >
              {link.label}
            </motion.a>
          ))}
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, easeOut } },
};
