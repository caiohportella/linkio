import CreateLinkForm from "@/components/forms/CreateLinkForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const NewLinkPage = async () => {
  return (
    <>
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Links
        </Link>
      </div>

      <div className="min-h-screen p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-16 bg-section-background backdrop-blur-sm border-2 border-section-border rounded-2xl p-8 shadow-md">
            {/* Left Side - Title and Description */}
            <div className="lg:w-2/5 lg:sticky lg:top-8">
              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                    Create New Link
                  </h1>
                  <div className="w-20 h-1 bg-gradient-to-r from-gray-800 via-emerald-500 to-[#1cabe9] rounded-full mt-4" />
                </div>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  Add a new link to your link-in-bio page. Your links will
                  appear in the order you create them (you can reorder them
                  later), making it easy for your audience to find what matters
                  most.
                </p>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-muted-foreground">
                      Easy drag & drop reordering
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <span className="text-muted-foreground">
                      Automatic URL validation
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-muted-foreground">
                      Click tracking analytics
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="lg:w-3/5">
              <div className="bg-card backdrop-blur-sm border border-border rounded-2xl p-8 shadow-md">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Link Details
                  </h2>
                  <p className="text-muted-foreground">
                    Fill in the information below to create your link.
                  </p>
                </div>

                <CreateLinkForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default NewLinkPage;
