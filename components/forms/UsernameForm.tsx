"use client";

import { usernameFormSchema } from "@/lib/validators";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  AlertCircle,
  CheckCircle,
  Copy,
  ExternalLink,
  Link2,
  Loader2,
  User,
} from "lucide-react";
import { Button } from "../ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { toast } from "sonner";
import { getBaseUrl } from "@/lib/utils";

const UsernameForm = () => {
  const { user } = useUser();

  const [debouncedUsername, setDebouncedUsername] = useState("");

  const form = useForm<z.infer<typeof usernameFormSchema>>({
    resolver: zodResolver(usernameFormSchema),
    defaultValues: {
      username: "",
    },
  });

  const watchedUsername = form.watch("username");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUsername(watchedUsername);
    }, 500);

    return () => clearTimeout(timer);
  }, [watchedUsername]);

  const currentSlug = useQuery(
    api.lib.usernames.getUserSlug,
    user?.id ? { userId: user.id } : "skip",
  );

  const availabilityCheck = useQuery(
    api.lib.usernames.checkUsernameAvailability,
    debouncedUsername.length >= 3 ? { username: debouncedUsername } : "skip",
  );

  const setUsername = useMutation(api.lib.usernames.setUsername);

  const getStatus = () => {
    if (!debouncedUsername || debouncedUsername.length < 3) return null;
    if (debouncedUsername !== watchedUsername) return "checking";
    if (!availabilityCheck) return "checking";
    if (debouncedUsername === currentSlug) return "current";
    return availabilityCheck.available ? "available" : "unavailable";
  };

  const status = getStatus();

  const hasCustomUsername = currentSlug && currentSlug !== user?.id;

  const isSubmitDisabled =
    status !== "available" || form.formState.isSubmitting;

  async function onSubmit(values: z.infer<typeof usernameFormSchema>) {
    if (!user?.id) return;

    try {
      const result = await setUsername({ username: values.username });

      if (result.success) {
        form.reset();
      } else {
        form.setError("username", { message: result.error });
      }
    } catch {
      form.setError("username", {
        message: "Failed to update username. Please try again.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-black to-gray-500 rounded-lg">
            <Link2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white/80">
              Customize Your Link
            </h2>
            <p className="text-white/50 text-sm">
              Choose a custom username for your link-in-bio page. This will be
              your public URL.
            </p>
          </div>
        </div>
      </div>

      {hasCustomUsername && (
        <div className="bg-green-50 border border-green-400 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-700">
                Current Username
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-green-600 bg-[#0d2630] px-2 py-1 rounded text-sm">
                {currentSlug}
              </span>
              <Link
                href={`/u/${currentSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-[#0d2630] rounded-full"></div>
          <span className="text-sm font-medium text-gray-700">
            Your Link Preview
          </span>
        </div>
        <div className="flex items-center">
          <Link
            href={`/u/${currentSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-gray-800 bg-white px-3 py-2 rounded border-l border-y hover:bg-gray-50 transition-colors truncate"
          >
            {getBaseUrl()}/u/{currentSlug}
          </Link>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${getBaseUrl()}/u/${currentSlug}`);
              toast.success("Copied to clipboard!");
            }}
            className="cursor-pointer flex items-center justify-center w-10 h-10 bg-white border rounded-r hover:bg-gray-50 transition-colors"
            title="Copy to clipboard"
          >
            <Copy className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="your_username"
                      {...field}
                      className="pr-10 text-white rounded-2xl"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {status === "checking" && (
                        <Loader2 className="w-4 h-4 text-green-500 animate-spin" />
                      )}
                      {status === "available" && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {status === "current" && (
                        <User className="w-4 h-4 text-[#0d2630]" />
                      )}
                      {status === "unavailable" && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                </FormControl>
                <FormDescription>
                  Your username can container letters, numbers, hyphens and
                  underscores.
                </FormDescription>
                {status === "available" && (
                  <p className="text-sm text-green-400">
                    Username is available!
                  </p>
                )}
                {status === "current" && (
                  <p className="text-sm text-blue-400">
                    This is your current username
                  </p>
                )}
                {status === "unavailable" && (
                  <p className="text-sm text-red-400">
                    {availabilityCheck?.error || "Username is already taken"}
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              className="cursor-pointer bg-[#009c00] hover:bg-[#00ff64] disabled:opacity-50 rounded-2xl text-white"
              disabled={isSubmitDisabled}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Username"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
export default UsernameForm;
