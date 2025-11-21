"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";

interface HighlightCardProps {
  link: Doc<"links">;
  onClick?: () => void;
}

const HighlightCard = ({ link, onClick }: HighlightCardProps) => {
  if (!link.highlight) return null;

  const { imageUrl, text, url } = link.highlight;

  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className="block w-full cursor-pointer group"
    >
      <motion.div
        className="relative w-full aspect-square rounded-3xl overflow-hidden border border-slate-200/50 shadow-sm"
        whileHover={{
          scale: 1.02,
          y: -2,
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Background Image */}
        <img
          src={imageUrl}
          alt={text}
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Floating Glassmorphic Bar */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center px-6">
          <motion.div
            className="bg-white/10 backdrop-blur-xs border border-white/20 text-white px-6 py-3 rounded-full font-medium text-center shadow-lg w-full max-w-[90%] flex items-center justify-center relative group-hover:bg-white/20 transition-colors duration-300"
            initial={{ y: 0 }}
            whileHover={{ y: -2 }}
          >
            <span className="truncate">{text}</span>
            <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-white" />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
};

export default HighlightCard;
