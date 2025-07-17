"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Unauthenticated } from "convex/react";
// import { useState } from "react";
// import { CustomAuthModal } from "../CustomAuthModal";
import { SignInButton } from "@clerk/nextjs";

export function HeroSection() {
  // const [showModal, setShowModal] = useState(false);

  return (
    <>
      <motion.section
        className="z-10 max-w-2xl space-y-6 text-center pt-36"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Logo Placeholder */}
        <motion.div
          className="mx-auto h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold shadow-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          L
        </motion.div>

        <h1 className="text-3xl md:text-7xl font-bold leading-tight text-foreground">
          All that you are, in one link
        </h1>

        <motion.p
          className="text-muted-foreground text-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Create a totally customizable link-in-bio page that showcases all your
          links with one short URL.
        </motion.p>

        <motion.div
          className="flex justify-center items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <Unauthenticated>
            <SignInButton
              mode="modal"
              appearance={{
                variables: {
                  colorPrimary: "#3b82f6",
                  colorText: "#ffffff",
                  colorBackground: "#175d79",
                },
              }}
            >
              <Button
                size="lg"
                // onClick={() => setShowModal(true)}
                className="px-8 py-6 text-lg font-semibold rounded-2xl"
              >
                Get Started{" "}
                <motion.span
                  initial={{ x: 0 }}
                  animate={{ x: [0, 10, 0] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <ArrowRight />
                </motion.span>
              </Button>
            </SignInButton>
          </Unauthenticated>
        </motion.div>

        <motion.div
          className="flex flex-col justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <p className="text-sm text-muted-foreground mb-4 mt-12">
            Trusted by 2,000+ creators worldwide
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 opacity-60">
            <div className="text-2xl md:text-2xl font-bold text-muted-foreground">
              Creator
            </div>
            <div className="text-2xl font-bold text-muted-foreground">
              Business
            </div>
            <div className="text-2xl font-bold text-muted-foreground">
              Influencer
            </div>
            <div className="text-2xl font-bold text-muted-foreground">
              Artist
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Custom Modal */}
      {/* <CustomAuthModal open={showModal} onOpenChange={setShowModal} /> */}
    </>
  );
}
