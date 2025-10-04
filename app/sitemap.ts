import { MetadataRoute } from 'next'
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { getBaseUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/sign-up`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sign-in`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  try {
    // Dynamic user pages
    const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const usernames = await client.query(api.lib.usernames.getAllUsernames);
    
    const userPages: MetadataRoute.Sitemap = usernames.map((username) => ({
      url: `${baseUrl}/${username.slug}`,
      lastModified: new Date(username._creationTime),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    return [...staticPages, ...userPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticPages;
  }
}
