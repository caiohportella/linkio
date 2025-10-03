import DashboardMetrics from "@/components/DashboardMetrics";
import CountryAnalytics from "@/components/CountryAnalytics";
import CustomizationForm from "@/components/forms/CustomizationForm";
import UsernameForm from "@/components/forms/UsernameForm";
import ManageLinks from "@/components/ManageLinks";
import { ManageFolders } from "@/components/ManageFolders"; // Import ManageFolders
import { api } from "@/convex/_generated/api";
import { fetchAnalytics, fetchProfileCountryAnalytics } from "@/lib/analytics";
import { currentUser } from "@clerk/nextjs/server";
import { preloadQuery } from "convex/nextjs";

const DashboardPage = async () => {
  const user = await currentUser();

  const preloadedLinks = await preloadQuery(api.lib.links.getLinksByUserId, {
    userId: user!.id,
  });

  const preloadedFolders = await preloadQuery(
    api.lib.folders.getFoldersByUserId,
    {
      userId: user!.id,
    },
  );

  const analytics = await fetchAnalytics(user!.id);
  const countryAnalytics = await fetchProfileCountryAnalytics(user!.id);

  return (
    <div>
      {/* Analytics Metrics */}
      <DashboardMetrics analytics={analytics} />

      {/* Country Analytics */}
      <CountryAnalytics analytics={countryAnalytics} />

      {/* Customize Link URL */}
      <div className="bg-grandient-to-br from-gray-50 to-gray-100 p-4 lg:p-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-section-background backdrop-blur-sm border-2 border-section-border rounded-2xl p-8 shadow-md">
            <UsernameForm />
          </div>
        </div>
      </div>

      {/* Customize Profile */}
      <div className="bg-grandient-to-br from-gray-50 to-gray-100 p-4 lg:p-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-section-background backdrop-blur-sm border-2 border-section-border rounded-2xl p-8 shadow-md">
            <CustomizationForm />
          </div>
        </div>
      </div>

      {/* Manage Links */}
      <div className="min-h-screen p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-section-background backdrop-blur-sm border-2 border-section-border rounded-2xl p-8 shadow-md">
            <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-16">
              {/* Left Side - Title and Description */}
              <div className="lg:w-2/5 lg:sticky top-8">
                <div className="space-y-6">
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                      Manage Your Links
                    </h1>
                    <div className="w-20 h-1 bg-gradient-to-r from-gray-800 via-emerald-500 to-[#1cabe9] rounded-full ml-4" />
                  </div>

                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Organize and customize your link-in-bio page. Drag and drop
                    to reorder, edit details or remove links that are no longer
                    needed.
                  </p>

                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-muted-foreground">
                        Drag & drop to reorder
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <span className="text-muted-foreground">
                        Realtime updates
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

              {/* Right Side - Link Management */}
              <div className="lg:w-3/5">
                <div className="dark:bg-card backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl gray-200/50 mb-8">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                      Your Links
                    </h2>
                    <p className="text-muted-foreground">
                      Drag to reorder, click to edit or delete unwanted links
                    </p>
                  </div>

                  <ManageLinks
                    preloadedLinks={preloadedLinks}
                    preloadedFolders={preloadedFolders}
                  />
                </div>
                <div className="dark:bg-card backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl gray-200/50">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                      Your Folders
                    </h2>
                    <p className="text-muted-foreground">
                      See how you can organize your links into folders and
                      reorder them
                    </p>
                  </div>

                  <ManageFolders
                    preloadedFolders={preloadedFolders}
                    preloadedLinks={preloadedLinks}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;
