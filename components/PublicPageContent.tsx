"use client";

import { api } from "@/convex/_generated/api";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { User } from "lucide-react";
import Image from "next/image";
import { getBaseUrl, hexToRgba, SUPPORTED_SOCIALS } from "@/lib/utils";
import Link from "next/link";
import Links from "./Links";

interface PublicPageContentProps {
  username: string;
  preloadedLinks: Preloaded<typeof api.lib.links.getLinksBySlug>;
  preloadedCustomizations: Preloaded<
    typeof api.lib.userCustomizations.getCustomizationsBySlug
  >;
}

const PublicPageContent = ({
  username,
  preloadedLinks,
  preloadedCustomizations,
}: PublicPageContentProps) => {
  const customizations = usePreloadedQuery(preloadedCustomizations);
  const accentColor = customizations?.accentColor || "#082f08";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Colored Header Section */}
      <div
        className="h-48 relative"
        style={{
          background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}ee 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-black-10"></div>
      </div>

      <div className="relative -mt-24 max-w-4xl mx-auto px-6 pb-16">
        <div className="flex flex-col lg:flex-row lg:gap-12 xl:gap-16">
          {/* Left Column - Profile */}
          <div className="lg:w-80 lg:flex-shrink-0 mb-12 lg:mb-0">
            <div className="text-center lg:text-left">
              {/* Profile Picture */}
              <div className="flex justify-center lg:justify-start mb-6 mt-10">
                <div className="relative">
                  {customizations?.profilePictureUrl ? (
                    <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg bg-white p-1">
                      <Image
                        src={customizations.profilePictureUrl}
                        alt={`${username}'s profile`}
                        width={88}
                        height={88}
                        className="w-full h-full object-contain rounded-full"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <User className="w-12 h-12 text-gray-600" />
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="space-y-3">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  @{username}
                </h1>
                {customizations?.description && (
                  <p className="text-gray-700 text-base leading-relaxed max-w-md mx-auto lg:mx-0">
                    {customizations.description}
                  </p>
                )}

                {(customizations?.socialLinks?.filter(
                  (link) => !!link.url && link.url.trim().length > 10,
                )?.length ?? 0) > 0 && (
                  <div className="flex justify-center lg:justify-start gap-x-4 pt-2">
                    {(customizations?.socialLinks ?? [])
                      .filter(
                        (link) => !!link.url && link.url.trim().length > 10,
                      )
                      .map(({ platform, url }) => {
                        const Icon = SUPPORTED_SOCIALS.find(
                          (s) => s.name === platform,
                        )?.icon;
                        return (
                          Icon && (
                            <Link
                              key={platform + url}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-black transition"
                              style={{ color: hexToRgba(accentColor, 0.8) }}
                            >
                              <Icon className="w-6 h-6" />
                            </Link>
                          )
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Links */}
          <div className="flex-1 min-w-0">
            <div
              className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 lg:p-10 shadow-xl border-[1px]"
              style={{ borderColor: accentColor }}
            >
              <Links preloadedLinks={preloadedLinks} />
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200/50 text-center">
          <p className="text-gray-600 text-sm">
            Powered by{" "}
            <Link
              href={getBaseUrl() + "/"}
              className="hover:underline"
              style={{ color: accentColor }}
            >
              Linkio
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default PublicPageContent;
