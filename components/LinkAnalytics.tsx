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
          <div className="bg-gray-500/80 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-md shadow-gray-200/50">
            <div className="flex items-center gap-4 mb-6">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-white/75 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Dashboard</span>
              </Link>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white/80 mb-2">
                {analytics.linkTitle}
              </h1>
              <Link
                href={analytics.linkUrl}
                className="flex items-center gap-2 text-white/80"
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
            <div className="bg-gray-500/80 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-md shadow-gray-200/50">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-black to-gray-500 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white/80">
                    Daily Performance
                  </h2>
                  <p className="text-white/80">Last 30 days activity</p>
                </div>
              </div>

              {/* Simple bar chart representation */}
              <DailyBarChart data={analytics.dailyData} />

              {analytics.dailyData.length > 10 && (
                <div className="mt-6 text-center">
                  <p className="text-gray-500 text-sm">
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
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8 mb-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl shadow-gray-200/50 text-center">
              <div className="text-gray-400 mb-4">
                <BarChart3 className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No analytics data yet
              </h3>
              <p className="text-gray-600">
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
