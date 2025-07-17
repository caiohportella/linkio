"use client";

import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <motion.div className="max-w-[100vw] overflow-hidden">
      {/* Canto superior esquerdo */}
      <motion.div
        className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-blue-500/30 blur-3xl"
        animate={{ x: [0, 50, -50, 0], y: [0, 50, -30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Centro inferior */}
      <motion.div
        className="absolute -bottom-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-sky-400/30 blur-3xl"
        animate={{ x: [0, -30, 30, 0], y: [0, -40, 40, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Canto superior direito */}
      <motion.div
        className="absolute top-20 right-0 h-[400px] w-[400px] rounded-full bg-cyan-400/30 blur-2xl"
        animate={{ x: [0, 40, -40, 0], y: [0, -30, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 🎯 Elemento animado central 1 */}
      <motion.div
        className="absolute top-1/3 left-1/3 h-[300px] w-[300px] rounded-full bg-purple-400/20 blur-2xl"
        animate={{ scale: [1, 1.2, 0.8, 1], rotate: [0, 15, -15, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 🎯 Elemento animado central 2 */}
      <motion.div
        className="absolute top-1/2 left-1/2 h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-400/20 blur-2xl"
        animate={{ x: [0, 20, -20, 0], y: [0, -20, 20, 0], scale: [1, 1.1, 0.9, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}
