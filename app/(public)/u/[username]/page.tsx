import PublicPageContent from "@/components/PublicPageContent";
import { api } from "@/convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import { Metadata } from "next";
import { ConvexHttpClient } from "convex/browser";
import { CustomizationsWithUrl } from "@/convex/lib/userCustomizations";
import { getBaseUrl } from "@/lib/utils";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
  searchParams?:
    | Promise<{ [key: string]: string | string[] | undefined }>
    | undefined;
}): Promise<Metadata> {
  const { username } = await params;
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

  const preloadedCustomizationsData: CustomizationsWithUrl | null =
    await client.query(api.lib.userCustomizations.getCustomizationsBySlug, {
      slug: username,
    });

  const title = username
    ? `${username}'s Linkio | Personal Profile`
    : "Linkio Profile";
  const description =
    preloadedCustomizationsData?.description ||
    "My personalized link-in-bio page.";

  // Handle profile picture URL properly
  let imageUrl = `${getBaseUrl()}/logo.png`; // Default fallback with full URL

  if (preloadedCustomizationsData?.profilePictureUrl) {
    // If it's already a full URL, use it as is
    if (preloadedCustomizationsData.profilePictureUrl.startsWith("http")) {
      imageUrl = preloadedCustomizationsData.profilePictureUrl;
    } else {
      // If it's a relative URL, make it absolute
      imageUrl = preloadedCustomizationsData.profilePictureUrl.startsWith("/")
        ? `${getBaseUrl()}${preloadedCustomizationsData.profilePictureUrl}`
        : `${getBaseUrl()}/${preloadedCustomizationsData.profilePictureUrl}`;
    }
  }

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${username}'s profile picture`,
          type: "image/jpeg",
        },
      ],
      url: `${getBaseUrl()}/u/${username}`,
      siteName: "Linkio",
      type: "profile",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      creator: "Caio H.",
      site: "Linkio",
      title: title,
      description: description,
      images: [imageUrl],
    },
    other: {
      "og:image:secure_url": imageUrl,
      "og:image:type": "image/jpeg",
    },
  };
}

const PublicLinkInBioPage = async ({
  params,
}: {
  params: Promise<{ username: string }>;
  searchParams?:
    | Promise<{ [key: string]: string | string[] | undefined }>
    | undefined;
}) => {
  const { username } = await params;
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

  const userId = await client.query(api.lib.usernames.getUserIdBySlug, {
    slug: username,
  });

  if (!userId) {
    notFound();
  }

  const [preloadedLinks, preloadedCustomizations, preloadedFolders] =
    await Promise.all([
      preloadQuery(api.lib.links.getLinksBySlug, {
        slug: username,
      }),
      preloadQuery(api.lib.userCustomizations.getCustomizationsBySlug, {
        slug: username,
      }),
      preloadQuery(api.lib.folders.getFoldersByUserId, {
        userId,
      }),
    ]);

  return (
    <PublicPageContent
      username={username}
      preloadedLinks={preloadedLinks}
      preloadedCustomizations={preloadedCustomizations}
      preloadedFolders={preloadedFolders} // Pass preloadedFolders to PublicPageContent
    />
  );
};
export default PublicLinkInBioPage;
