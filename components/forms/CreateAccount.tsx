"use client";

import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { SiGithub, SiGoogle, SiLinkedin } from "react-icons/si";
import { useSignIn } from "@clerk/nextjs";

export function CreateAccount() {
  const { signIn } = useSignIn();

  const handleOAuthLogin = async (
    provider: "github" | "google" | "linkedin" | "apple",
  ) => {
    try {
      await signIn?.authenticateWithRedirect({
        strategy: `oauth_${provider}`,
        redirectUrl: `${process.env.NEXT_PUBLIC_CLERK_FRONTEND_API}/v1/oauth_callback`,
        //https://engaged-dingo-72.clerk.accounts.dev/v1/oauth_callback
        redirectUrlComplete: "/dashboard",
      });
    } catch (err) {
      console.error("OAuth login failed:", err);
    }
  };

  return (
    <Card className="rounded-2xl bg-[#0d2630] text-white border border-zinc-800 shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-white">
          Welcome to Linkio!
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Complete your sign up choosing one of the OAuths below
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4">
        {/* OAuth buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="bg-[#0d2630] border-zinc-700 hover:bg-zinc-700 rounded-2xl text-white"
            onClick={() => handleOAuthLogin("github")}
          >
            <SiGithub className="mr-2 h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="bg-[0d2630] border-zinc-700 hover:bg-zinc-700 rounded-2xl text-white"
            onClick={() => handleOAuthLogin("google")}
          >
            <SiGoogle className="mr-2 h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="bg-[0d2630] border-zinc-700 hover:bg-zinc-700 rounded-2xl text-white"
            onClick={() => handleOAuthLogin("linkedin")}
          >
            <SiLinkedin className="mr-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>

      <CardFooter>
        <Button className="w-full bg-blue-600/50 hover:bg-blue-500 text-white rounded-full">
          Create account
        </Button>
      </CardFooter>
    </Card>
  );
}
