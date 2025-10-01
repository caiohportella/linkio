"use client";

import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
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
import { Id } from "@/convex/_generated/dataModel";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Folder name is required")
    .max(100, "Folder name must be less than 100 characters"),
});

interface CreateFolderFormProps {
  onFolderCreated?: () => void;
  folderId?: Id<"folders">;
  initialName?: string;
}

const CreateFolderForm = ({ onFolderCreated, folderId, initialName }: CreateFolderFormProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, startSubmitting] = useTransition();
  const router = useRouter();
  const createFolder = useMutation(api.lib.folders.createFolder);
  const updateFolder = useMutation(api.lib.folders.updateFolder);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialName ?? "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null);
    startSubmitting(async () => {
      try {
        if (folderId) {
          await updateFolder({ folderId, name: values.name });
          toast.success("Folder updated successfully!");
        } else {
          await createFolder({ name: values.name });
          toast.success("Folder created successfully!");
        }
        form.reset();
        if (onFolderCreated) {
          onFolderCreated();
        } else {
          router.refresh();
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
                {folderId ? "Updating Folder..." : "Creating Folder..."}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2 animate-pulse" />
                {folderId ? "Save Changes" : "Create Folder"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateFolderForm;
