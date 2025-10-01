"use client";

import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Loader2, Folder, Plus } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Folder name is required")
    .max(100, "Folder name must be less than 100 characters"),
});

interface CreateFolderFormProps {
  onFolderCreated?: () => void;
}

const CreateFolderForm = ({ onFolderCreated }: CreateFolderFormProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, startSubmitting] = useTransition();
  const router = useRouter();
  const createFolder = useMutation(api.lib.folders.createFolder);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null);
    startSubmitting(async () => {
      try {
        await createFolder({ name: values.name });
        toast.success("Folder created successfully!");
        form.reset(); // Clear the form after successful submission
        if (onFolderCreated) {
          onFolderCreated();
        } else {
          router.refresh(); // Refresh to show new folder only if not in modal
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create folder",
        );
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Folder Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="My new folder"
                  {...field}
                  className="text-muted-foreground rounded-2xl"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <p className="text-destructive text-sm mb-4 text-center">{error}</p>
        )}

        <div className="flex flex-col gap-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl cursor-pointer bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Creating Folder...
              </>
            ) : (
              <>
                <Folder className="w-4 h-4 mr-2 animate-pulse" />
                Create Folder
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateFolderForm;
