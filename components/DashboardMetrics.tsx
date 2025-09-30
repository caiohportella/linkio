import { AnalyticsData } from "@/lib/types";
import { formatDate, formatReferrer } from "@/lib/utils";
import {
  Calendar,
  Clock,
  ExternalLink,
  Globe,
  Link,
  MapPin,
  MousePointer,
  TrendingUp,
} from "lucide-react";
import { MetricCard } from "./MetricCard";

interface DashboardMetricsProps {
  analytics: AnalyticsData;
}

const DashboardMetrics = ({ analytics }: DashboardMetricsProps) => {
  return (
    <div className=" p-4 lg:p-8 mb-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-section-background backdrop-blur-sm border-2 border-section-border rounded-2xl p-8 shadow-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Analytics Overview
            </h2>
            <p className="text-foreground">Last 30 days performance metrics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {/* Total Clicks */}
            <MetricCard
              icon={<MousePointer className="w-6 h-6" />}
              badge={<TrendingUp className="w-5 h-5" />}
              title="Total Clicks"
              value={analytics.totalClicks.toLocaleString()}
              color="blue"
            />

            {/* Countries Reached */}
            <MetricCard
              icon={<Globe className="w-6 h-6" />}
              badge={<MapPin className="w-5 h-5" />}
              title="Countries"
              value={analytics.countriesReached.toLocaleString()}
              color="green"
            />

            {/* Total Links Clicked */}
            <MetricCard
              icon={<Link className="w-6 h-6" />}
              badge={<ExternalLink className="w-5 h-5" />}
              title="Links Clicked"
              value={analytics.totalLinksClicked.toLocaleString()}
              color="indigo"
            />

            {/* Activity Period */}
            <MetricCard
              icon={<Calendar className="w-6 h-6" />}
              badge={<Clock className="w-5 h-5" />}
              title="Last Activity"
              value={formatDate(analytics.lastClick)}
              color="orange"
            />
          </div>

          {/* Additional Metrics */}
          {(analytics.topLinkTitle || analytics.topReferrer) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Perfoming Link */}
              {analytics.topLinkTitle && (
                <MetricCard
                  icon={<ExternalLink className="w-6 h-6" />}
                  title="Top Performing Link"
                  value={analytics.topLinkTitle}
                  color="slate"
                />
              )}

              {/* Top Referrer */}
              {analytics.topReferrer && (
                <MetricCard
                  icon={<Globe className="w-6 h-6" />}
                  title="Top Referrer"
                  value={formatReferrer(analytics.topReferrer)}
                  color="slate"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default DashboardMetrics;
