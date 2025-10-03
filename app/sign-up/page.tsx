"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SiGithub, SiGoogle } from "react-icons/si";
import { useSignIn } from "@clerk/nextjs";
import { ArrowRight, Lock, Loader2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import Navbar from "@/components/Navbar";
import Image from "next/image";

export default function SignUpPage() {
  const { signIn } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const handleOAuthLogin = async (
    provider: "github" | "google" | "apple",
  ) => {
    try {
      setOauthLoading(provider);
      await signIn?.authenticateWithRedirect({
        strategy: `oauth_${provider}`,
        redirectUrl: `${process.env.NEXT_PUBLIC_CLERK_FRONTEND_API}/v1/oauth_callback`,
        redirectUrlComplete: "/dashboard",
      });
    } catch (err) {
      console.error("OAuth login failed:", err);
      setOauthLoading(null);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (!showPassword) {
      // First step: show password field
      setShowPassword(true);
      return;
    }

    // Second step: create account
    if (!password) return;

    try {
      setIsLoading(true);
      // Handle email sign-up logic here
      console.log("Email sign-up:", { email, password });
    } catch (err) {
      console.error("Email sign-up failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <AnimatedBackground />
      <Navbar />

      {/* Sign-up form */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 pt-20">
        <motion.div
          key="signup"
          initial={{ opacity: 0, x: 100, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -100, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="w-full max-w-md"
        >
          <Card className="w-full rounded-2xl bg-[#0d2630] text-white border border-zinc-800 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold text-white flex flex-col items-center justify-center">
              <Image src="/logo.png" alt="Linkio" width={100} height={100} />
              Welcome to Linkio
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Create your personalized link-in-bio page in seconds
            </CardDescription>
          </CardHeader>

           <CardContent className="space-y-6">
             {/* Email sign-up form */}
             <form onSubmit={handleEmailSignUp} className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="email" className="text-zinc-300">
                   Email address
                 </Label>
                 <Input
                   id="email"
                   type="email"
                   placeholder="Enter your email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500 rounded-2xl"
                   required
                 />
               </div>

               {/* Animated Password Field */}
               <AnimatePresence>
                 {showPassword && (
                   <motion.div
                     initial={{ opacity: 0, height: 0, y: -10 }}
                     animate={{ opacity: 1, height: "auto", y: 0 }}
                     exit={{ opacity: 0, height: 0, y: -10 }}
                     transition={{ duration: 0.3, ease: "easeOut" }}
                     className="space-y-2 overflow-hidden"
                   >
                     <Label htmlFor="password" className="text-zinc-300">
                       Password
                     </Label>
                     <Input
                       id="password"
                       type="password"
                       placeholder="Create a password"
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500 rounded-2xl"
                       required
                     />
                   </motion.div>
                 )}
               </AnimatePresence>

               <Button
                 type="submit"
                 className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-2xl cursor-pointer"
                 disabled={isLoading}
               >
                 {!showPassword ? (
                   <>
                     Continue
                     <motion.span
                       animate={{ x: [0, 5, 0] }}
                       transition={{
                         duration: 1,
                         repeat: Infinity,
                         ease: "easeInOut",
                       }}
                     >
                       <ArrowRight className="ml-2 h-4 w-4" />
                     </motion.span>
                   </>
                 ) : (
                   <>
                     <Lock className="mr-2 h-4 w-4" />
                     {isLoading ? "Creating account..." : "Create account"}
                   </>
                 )}
               </Button>
             </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0d2630] px-2 text-zinc-500">
                  Or continue with
                </span>
              </div>
            </div>

             {/* OAuth buttons */}
             <div className="grid grid-cols-2 gap-3">
               <Button
                 variant="outline"
                 className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 rounded-2xl text-white cursor-pointer"
                 onClick={() => handleOAuthLogin("google")}
                 disabled={isLoading || oauthLoading !== null}
               >
                 {oauthLoading === "google" ? (
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                 ) : (
                   <SiGoogle className="mr-2 h-4 w-4" />
                 )}
                 Google
               </Button>

               <Button
                 variant="outline"
                 className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 rounded-2xl text-white cursor-pointer"
                 onClick={() => handleOAuthLogin("github")}
                 disabled={isLoading || oauthLoading !== null}
               >
                 {oauthLoading === "github" ? (
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                 ) : (
                   <SiGithub className="mr-2 h-4 w-4" />
                 )}
                 GitHub
               </Button>
             </div>
          </CardContent>

           {/* Footer */}
           <div className="px-6 pb-6">
             <p className="text-center text-sm text-zinc-500">
               Already have an account?{" "}
               <button
                 onClick={() => router.push("/sign-in")}
                 className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
               >
                 Sign in
               </button>
             </p>
           </div>
         </Card>
        </motion.div>
       </div>
    </main>
  );
}
