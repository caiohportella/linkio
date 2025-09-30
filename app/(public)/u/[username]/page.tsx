import PublicPageContent from "@/components/PublicPageContent";
import { api } from "@/convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import { Metadata } from "next";
import { ConvexHttpClient } from "convex/browser";
import { CustomizationsWithUrl } from "@/convex/lib/userCustomizations";
import { getBaseUrl } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | undefined;
}): Promise<Metadata> {
  const { username } = await params;
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

  const preloadedCustomizationsData: CustomizationsWithUrl | null = await client.query(
    api.lib.userCustomizations.getCustomizationsBySlug,
    { slug: username },
  );

  const title = username
    ? `${username}'s Linkio`
    : "Linkio Profile";
  const description = preloadedCustomizationsData?.description || "My personalized link-in-bio page.";
  const imageUrl = preloadedCustomizationsData?.profilePictureUrl || "/logo.png"; // Fallback to a default logo

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: title,
        },
      ],
      url: `${getBaseUrl()}/u/${username}`,
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [imageUrl],
    },
  };
}

const PublicLinkInBioPage = async ({
  params,
}: {
  params: Promise<{ username: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | undefined;
}) => {
  const { username } = await params;

  const [preloadedLinks, preloadedCustomizations] = await Promise.all([
    preloadQuery(api.lib.links.getLinksBySlug, {
      slug: username,
    }),
    preloadQuery(api.lib.userCustomizations.getCustomizationsBySlug, {
      slug: username,
    }),
  ]);

  return (
    <PublicPageContent
      username={username}
      preloadedLinks={preloadedLinks}
      preloadedCustomizations={preloadedCustomizations}
    />
  );
};
export default PublicLinkInBioPage;
