"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Authenticated } from "convex/react";
import { UserButton } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const router = useRouter();

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="relative flex items-center justify-center w-full h-full">
        {/* Left (alignment) */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2" />

        {/* Center (Logo) */}
        <motion.div
          className="text-2xl font-bold text-foreground cursor-pointer flex items-center"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          onClick={() => router.push("/")}
        >
          <Image src="/logo.png" alt="Logo" width={50} height={50} />
          Linkio
        </motion.div>

        {/* Right (User avatar) */}
        <Authenticated>
          <motion.div
            className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
          >
            <Button
              onClick={() => router.push("/dashboard/new-link")}
              className="rounded-full w-8 h-8 md:w-auto md:h-auto px-0 md:px-4 py-0 md:py-2"
            >
              <div className="flex justify-center items-center">
                <Plus className="w-4 h-4 animate-pulse" />
                <span className="hidden md:inline ml-2">Add Link</span>
              </div>
            </Button>

            <UserButton />
          </motion.div>
        </Authenticated>
      </div>
    </motion.header>
  );
}
