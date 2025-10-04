"use client";

import { SignIn, SignUp } from "@clerk/nextjs";

interface ClerkAuthWrapperProps {
  mode: "sign-in" | "sign-up";
}

export function ClerkAuthWrapper({ mode }: ClerkAuthWrapperProps) {

  if (mode === "sign-in") {
    return (
      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full max-w-md",
            card: "bg-[#0d2630] border border-zinc-800 shadow-lg rounded-2xl",
            headerTitle: "text-white text-3xl font-bold",
            headerSubtitle: "text-zinc-400",
            socialButtonsBlockButton: "bg-zinc-800 border-zinc-700 hover:bg-zinc-700 rounded-2xl text-white",
            formButtonPrimary: "bg-blue-600 hover:bg-blue-500 text-white rounded-2xl",
            formFieldInput: "bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500 rounded-2xl",
            footerActionLink: "text-blue-400 hover:text-blue-300",
            identityPreviewText: "text-zinc-300",
            formFieldLabel: "text-zinc-300",
            dividerLine: "bg-zinc-700",
            dividerText: "text-zinc-500 bg-[#0d2630]",
          },
        }}
        redirectUrl="/dashboard"
        afterSignInUrl="/dashboard"
      />
    );
  }

  return (
    <SignUp
      appearance={{
        elements: {
          rootBox: "w-full max-w-md",
          card: "bg-[#0d2630] border border-zinc-800 shadow-lg rounded-2xl",
          headerTitle: "text-white text-3xl font-bold",
          headerSubtitle: "text-zinc-400",
          socialButtonsBlockButton: "bg-zinc-800 border-zinc-700 hover:bg-zinc-700 rounded-2xl text-white",
          formButtonPrimary: "bg-blue-600 hover:bg-blue-500 text-white rounded-2xl",
          formFieldInput: "bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500 rounded-2xl",
          footerActionLink: "text-blue-400 hover:text-blue-300",
          identityPreviewText: "text-zinc-300",
          formFieldLabel: "text-zinc-300",
          dividerLine: "bg-zinc-700",
          dividerText: "text-zinc-500 bg-[#0d2630]",
        },
      }}
      redirectUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    />
  );
}
