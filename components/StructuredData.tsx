import { getBaseUrl } from "@/lib/utils";

interface StructuredDataProps {
  type: 'website' | 'profile';
  username?: string;
  profileData?: {
    name?: string;
    description?: string;
    image?: string;
    links?: Array<{
      title: string;
      url: string;
    }>;
  };
}

export function StructuredData({ type, username, profileData }: StructuredDataProps) {
  const baseUrl = getBaseUrl();

  const getWebsiteStructuredData = () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Linkio",
    "description": "Create your personalized link-in-bio page. Curate, organize, and share everything you want on your own page. Perfect for creators, influencers, and professionals.",
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/{search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Linkio",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      }
    }
  });

  const getProfileStructuredData = () => ({
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "name": profileData?.name || username,
    "description": profileData?.description || `${username}'s personalized link-in-bio page`,
    "url": `${baseUrl}/${username}`,
    "image": profileData?.image || `${baseUrl}/logo.png`,
    "mainEntity": {
      "@type": "Person",
      "name": profileData?.name || username,
      "description": profileData?.description,
      "image": profileData?.image,
      "sameAs": profileData?.links?.map(link => link.url) || []
    }
  });

  const structuredData = type === 'website' ? getWebsiteStructuredData() : getProfileStructuredData();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  );
}
