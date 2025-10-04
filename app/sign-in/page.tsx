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
import { Mail, Loader2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ClerkAuthWrapper } from "@/components/ClerkAuthWrapper";

export default function SignInPage() {
  const { signIn, isLoaded } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [useClerkComponent, setUseClerkComponent] = useState(false);

  const handleOAuthLogin = async (
    provider: "github" | "google",
  ) => {
    if (!isLoaded || !signIn) return;
    
    try {
      setOauthLoading(provider);
      await signIn.authenticateWithRedirect({
        strategy: `oauth_${provider}` as any,
        redirectUrl: '/sign-in/sso-callback',
        redirectUrlComplete: '/dashboard',
      });
    } catch (err) {
      console.error("OAuth login failed:", err);
      setOauthLoading(null);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    try {
      setIsLoading(true);
      
      // Attempt to sign in
      const result = await signIn?.create({
        identifier: email,
        password: password,
      });

      if (result?.status === "complete") {
        // Sign in successful, redirect to dashboard
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      console.error("Email sign-in failed:", err);
      const errorMessage = err instanceof Error && 'errors' in err 
        ? (err as { errors: Array<{ message: string }> }).errors?.[0]?.message 
        : "Failed to sign in. Please check your credentials.";
      
      // If there's a configuration error, fall back to Clerk component
      if (errorMessage.includes("email_address is not a valid parameter")) {
        setUseClerkComponent(true);
        return;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <AnimatedBackground />
      <Navbar />
      
      {/* CAPTCHA element for Clerk */}
      <div id="clerk-captcha" className="hidden" />

      {/* Sign-in form */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 pt-20">
        {useClerkComponent ? (
          <ClerkAuthWrapper mode="sign-in" />
        ) : (
          <motion.div
            key="signin"
            initial={{ opacity: 0, x: -100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full max-w-md"
          >
            <Card className="w-full rounded-2xl bg-[#0d2630] text-white border border-zinc-800 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold text-white flex flex-col items-center justify-center">
              <Image src="/logo.png" alt="Linkio" width={100} height={100} />
              Welcome back
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Sign in to your Linkio account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Email sign-in form */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
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

              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500 rounded-2xl"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-2xl cursor-pointer"
                disabled={isLoading}
              >
                <Mail className="mr-2 h-4 w-4" />
                {isLoading ? "Signing in..." : "Sign in"}
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
              Don&apos;t have an account?{" "}
              <button
                onClick={() => router.push("/sign-up")}
                className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                Sign up
              </button>
            </p>
          </div>
        </Card>
          </motion.div>
        )}
      </div>
    </main>
  );
}
