import { LinkAnalyticsData } from "@/lib/types";
import { formatUrl } from "@/lib/utils";
import {
  ArrowLeft,
  BarChart3,
  ExternalLink,
  Globe,
  MapPin,
  MousePointer,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { MetricCard } from "./MetricCard";

import { DailyBarChart } from "./DailyBarChart";

interface LinkAnalyticsProps {
  analytics: LinkAnalyticsData;
}

const LinkAnalytics = async ({ analytics }: LinkAnalyticsProps) => {
  return (
    <div>
      {/* Header with back button */}
      <div className="p-4 lg:p-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-section-background backdrop-blur-sm border-2 border-section-border rounded-2xl p-8 shadow-md">
            <div className="flex items-center gap-4 mb-6">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Dashboard</span>
              </Link>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {analytics.linkTitle}
              </h1>
              <Link
                href={analytics.linkUrl}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm">{formatUrl(analytics.linkUrl)}</span>
              </Link>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Clicks */}
              <MetricCard
                icon={<MousePointer className="w-6 h-6" />}
                badge={<TrendingUp className="w-5 h-5" />}
                title="Total Clicks"
                value={analytics.totalClicks.toLocaleString()}
                color="blue"
              />

              {/* Unique Users */}
              <MetricCard
                icon={<Users className="w-6 h-6" />}
                badge={<TrendingUp className="w-5 h-5" />}
                title="Unique Users"
                value={analytics.uniqueUsers.toLocaleString()}
                color="indigo"
              />

              {/* Countries Reached */}
              <MetricCard
                icon={<Globe className="w-6 h-6" />}
                badge={<MapPin className="w-5 h-5" />}
                title="Countries"
                value={analytics.countriesReached.toLocaleString()}
                color="green"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Daily Performance Chart */}
      {analytics.dailyData.length > 0 && (
        <div className="p-4 lg:p-8 mb-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-section-background backdrop-blur-sm border-2 border-section-border rounded-2xl p-8 shadow-md">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-black to-gray-500 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Daily Performance
                  </h2>
                  <p className="text-muted-foreground">Last 30 days activity</p>
                </div>
              </div>

              {/* Simple bar chart representation */}
              <DailyBarChart data={analytics.dailyData} />

              {analytics.dailyData.length > 10 && (
                <div className="mt-6 text-center">
                  <p className="text-muted-foreground text-sm">
                    Showing last 10 days · {analytics.dailyData.length}
                    days total
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* No data state */}
      {analytics.dailyData.length === 0 && (
        <div className="p-4 lg:p-8 mb-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-section-background backdrop-blur-sm border-2 border-section-border rounded-2xl p-8 shadow-md text-center">
              <div className="text-muted-foreground mb-4">
                <BarChart3 className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No analytics data yet
              </h3>
              <p className="text-muted-foreground">
                Analytics will appear here once this link starts receiving
                clicks.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default LinkAnalytics;
