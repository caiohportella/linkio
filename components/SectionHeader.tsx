import { cn } from "@/lib/utils"; // or remove if not using a utility
import { motion } from "framer-motion";

interface SectionHeaderProps {
  label: string;
  title: string;
  backgroundText: string;
  className?: string;
}

export function SectionHeader({
  label,
  title,
  backgroundText,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("relative text-center", className)}>
      {/* Background outline text */}
      <motion.h2
        className="pointer-events-none select-none text-[10vw] font-bold uppercase tracking-tight text-foreground/5"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        aria-hidden
      >
        {backgroundText}
      </motion.h2>

      {/* Foreground content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
        <p className="mb-2 text-sm font-semibold text-primary tracking-wide">
          {label}
        </p>
        <h3 className="text-3xl md:text-4xl font-bold text-foreground">
          {title}
        </h3>
      </div>
    </div>
  );
}
