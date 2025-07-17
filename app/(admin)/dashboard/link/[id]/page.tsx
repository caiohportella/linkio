import LinkAnalytics from "@/components/LinkAnalytics";
import { fetchLinkAnalytics } from "@/lib/analytics";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

interface LinkAnalyticsPageProps {
  params: Promise<{ id: string }>;
}

const LinkAnalyticsPage = async ({ params }: LinkAnalyticsPageProps) => {
  const user = await currentUser();
  const { id } = await params;

  if (!user) notFound();

  const analytics = await fetchLinkAnalytics(user.id, id);

  if (!analytics) {
    const emptyAnalytics = {
      linkId: id,
      linkTitle: "This link has no analytics",
      linkUrl: "Please wait for analytics to be generated or check back later",
      totalClicks: 0,
      uniqueUsers: 0,
      countriesReached: 0,
      dailyData: [],
      countryData: [],
    };

    return <LinkAnalytics analytics={emptyAnalytics} />;
  }

  return <LinkAnalytics analytics={analytics} />;
};
export default LinkAnalyticsPage;
