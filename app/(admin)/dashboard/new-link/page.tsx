import CreateLinkForm from "@/components/forms/CreateLinkForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const NewLinkPage = async () => {
  return (
    <>
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[#1cabe9]/75 hover:text-[#1e6b8a] transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Links
        </Link>
      </div>

      <div className="min-h-screen p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-16 bg-gray-500/80 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-md shadow-gray-200/50">
            {/* Left Side - Title and Description */}
            <div className="lg:w-2/5 lg:sticky lg:top-8">
              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-white/75 leading-tight">
                    Create New Link
                  </h1>
                  <div className="w-20 h-1 bg-gradient-to-r from-gray-800 via-emerald-500 to-[#1cabe9] rounded-full mt-4" />
                </div>

                <p className="text-lg text-white/75 leading-relaxed">
                  Add a new link to your link-in-bio page. Your links will
                  appear in the order you create them (you can reorder them
                  later), making it easy for your audience to find what matters
                  most.
                </p>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-white/75">
                      Easy drag & drop reordering
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <span className="text-white/75">
                      Automatic URL validation
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-white/75">
                      Click tracking analytics
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="lg:w-3/5">
              <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-md shadow-gray-200/50">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Link Details
                  </h2>
                  <p className="text-gray-500">
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
