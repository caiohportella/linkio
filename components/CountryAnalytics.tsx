import { ProfileCountryAnalytics } from "@/lib/analytics";
import {
  Globe,
  MapPin,
  MousePointer,
  TrendingUp,
  Users,
} from "lucide-react";
import { MetricCard } from "./MetricCard";

interface CountryAnalyticsProps {
  analytics: ProfileCountryAnalytics;
}

// Country code to flag emoji mapping
const getCountryFlag = (countryCode: string): string => {
  const flagMap: Record<string, string> = {
    "United States": "🇺🇸",
    "US": "🇺🇸",
    "Canada": "🇨🇦",
    "CA": "🇨🇦",
    "United Kingdom": "🇬🇧",
    "UK": "🇬🇧",
    "GB": "🇬🇧",
    "Germany": "🇩🇪",
    "DE": "🇩🇪",
    "France": "🇫🇷",
    "FR": "🇫🇷",
    "Spain": "🇪🇸",
    "ES": "🇪🇸",
    "Italy": "🇮🇹",
    "IT": "🇮🇹",
    "Brazil": "🇧🇷",
    "BR": "🇧🇷",
    "Mexico": "🇲🇽",
    "MX": "🇲🇽",
    "Argentina": "🇦🇷",
    "AR": "🇦🇷",
    "Japan": "🇯🇵",
    "JP": "🇯🇵",
    "China": "🇨🇳",
    "CN": "🇨🇳",
    "India": "🇮🇳",
    "IN": "🇮🇳",
    "Australia": "🇦🇺",
    "AU": "🇦🇺",
    "South Korea": "🇰🇷",
    "KR": "🇰🇷",
    "Netherlands": "🇳🇱",
    "NL": "🇳🇱",
    "Sweden": "🇸🇪",
    "SE": "🇸🇪",
    "Norway": "🇳🇴",
    "NO": "🇳🇴",
    "Denmark": "🇩🇰",
    "DK": "🇩🇰",
    "Finland": "🇫🇮",
    "FI": "🇫🇮",
    "Switzerland": "🇨🇭",
    "CH": "🇨🇭",
    "Austria": "🇦🇹",
    "AT": "🇦🇹",
    "Belgium": "🇧🇪",
    "BE": "🇧🇪",
    "Portugal": "🇵🇹",
    "PT": "🇵🇹",
    "Poland": "🇵🇱",
    "PL": "🇵🇱",
    "Czech Republic": "🇨🇿",
    "CZ": "🇨🇿",
    "Hungary": "🇭🇺",
    "HU": "🇭🇺",
    "Romania": "🇷🇴",
    "RO": "🇷🇴",
    "Bulgaria": "🇧🇬",
    "BG": "🇧🇬",
    "Croatia": "🇭🇷",
    "HR": "🇭🇷",
    "Slovenia": "🇸🇮",
    "SI": "🇸🇮",
    "Slovakia": "🇸🇰",
    "SK": "🇸🇰",
    "Estonia": "🇪🇪",
    "EE": "🇪🇪",
    "Latvia": "🇱🇻",
    "LV": "🇱🇻",
    "Lithuania": "🇱🇹",
    "LT": "🇱🇹",
    "Ireland": "🇮🇪",
    "IE": "🇮🇪",
    "Iceland": "🇮🇸",
    "IS": "🇮🇸",
    "Luxembourg": "🇱🇺",
    "LU": "🇱🇺",
    "Malta": "🇲🇹",
    "MT": "🇲🇹",
    "Cyprus": "🇨🇾",
    "CY": "🇨🇾",
    "Greece": "🇬🇷",
    "GR": "🇬🇷",
    "Turkey": "🇹🇷",
    "TR": "🇹🇷",
    "Russia": "🇷🇺",
    "RU": "🇷🇺",
    "Ukraine": "🇺🇦",
    "UA": "🇺🇦",
    "Belarus": "🇧🇾",
    "BY": "🇧🇾",
    "Moldova": "🇲🇩",
    "MD": "🇲🇩",
    "Serbia": "🇷🇸",
    "RS": "🇷🇸",
    "Montenegro": "🇲🇪",
    "ME": "🇲🇪",
    "Bosnia and Herzegovina": "🇧🇦",
    "BA": "🇧🇦",
    "North Macedonia": "🇲🇰",
    "MK": "🇲🇰",
    "Albania": "🇦🇱",
    "AL": "🇦🇱",
    "Kosovo": "🇽🇰",
    "XK": "🇽🇰",
    "South Africa": "🇿🇦",
    "ZA": "🇿🇦",
    "Egypt": "🇪🇬",
    "EG": "🇪🇬",
    "Nigeria": "🇳🇬",
    "NG": "🇳🇬",
    "Kenya": "🇰🇪",
    "KE": "🇰🇪",
    "Morocco": "🇲🇦",
    "MA": "🇲🇦",
    "Tunisia": "🇹🇳",
    "TN": "🇹🇳",
    "Algeria": "🇩🇿",
    "DZ": "🇩🇿",
    "Libya": "🇱🇾",
    "LY": "🇱🇾",
    "Sudan": "🇸🇩",
    "SD": "🇸🇩",
    "Ethiopia": "🇪🇹",
    "ET": "🇪🇹",
    "Ghana": "🇬🇭",
    "GH": "🇬🇭",
    "Ivory Coast": "🇨🇮",
    "CI": "🇨🇮",
    "Senegal": "🇸🇳",
    "SN": "🇸🇳",
    "Mali": "🇲🇱",
    "ML": "🇲🇱",
    "Burkina Faso": "🇧🇫",
    "BF": "🇧🇫",
    "Niger": "🇳🇪",
    "NE": "🇳🇪",
    "Chad": "🇹🇩",
    "TD": "🇹🇩",
    "Cameroon": "🇨🇲",
    "CM": "🇨🇲",
    "Central African Republic": "🇨🇫",
    "CF": "🇨🇫",
    "Democratic Republic of the Congo": "🇨🇩",
    "CD": "🇨🇩",
    "Republic of the Congo": "🇨🇬",
    "CG": "🇨🇬",
    "Gabon": "🇬🇦",
    "GA": "🇬🇦",
    "Equatorial Guinea": "🇬🇶",
    "GQ": "🇬🇶",
    "Sao Tome and Principe": "🇸🇹",
    "ST": "🇸🇹",
    "Angola": "🇦🇴",
    "AO": "🇦🇴",
    "Zambia": "🇿🇲",
    "ZM": "🇿🇲",
    "Zimbabwe": "🇿🇼",
    "ZW": "🇿🇼",
    "Botswana": "🇧🇼",
    "BW": "🇧🇼",
    "Namibia": "🇳🇦",
    "NA": "🇳🇦",
    "Lesotho": "🇱🇸",
    "LS": "🇱🇸",
    "Swaziland": "🇸🇿",
    "SZ": "🇸🇿",
    "Madagascar": "🇲🇬",
    "MG": "🇲🇬",
    "Mauritius": "🇲🇺",
    "MU": "🇲🇺",
    "Seychelles": "🇸🇨",
    "SC": "🇸🇨",
    "Comoros": "🇰🇲",
    "KM": "🇰🇲",
    "Mayotte": "🇾🇹",
    "YT": "🇾🇹",
    "Reunion": "🇷🇪",
    "RE": "🇷🇪",
    "Unknown": "🌍",
  };

  return flagMap[countryCode] || "🌍";
};

const CountryAnalytics = ({ analytics }: CountryAnalyticsProps) => {
  if (analytics.countries.length === 0) {
    return (
      <div className="p-4 lg:p-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-section-background backdrop-blur-sm border-2 border-section-border rounded-2xl p-8 shadow-md text-center">
            <div className="text-muted-foreground mb-4">
              <Globe className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No country data yet
            </h3>
            <p className="text-muted-foreground">
              Country analytics will appear here once your links start receiving clicks from different countries.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 mb-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-section-background backdrop-blur-sm border-2 border-section-border rounded-2xl p-8 shadow-md">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Global Reach
              </h2>
              <p className="text-muted-foreground">
                Countries that have visited your links
              </p>
            </div>
          </div>

          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <MetricCard
              icon={<Globe className="w-6 h-6" />}
              badge={<MapPin className="w-5 h-5" />}
              title="Countries Reached"
              value={analytics.totalCountries.toLocaleString()}
              color="green"
            />

            <MetricCard
              icon={<MousePointer className="w-6 h-6" />}
              badge={<TrendingUp className="w-5 h-5" />}
              title="Total Clicks"
              value={analytics.totalClicks.toLocaleString()}
              color="blue"
            />

            <MetricCard
              icon={<Users className="w-6 h-6" />}
              badge={<TrendingUp className="w-5 h-5" />}
              title="Global Users"
              value={analytics.countries.reduce((sum, country) => sum + country.uniqueUsers, 0).toLocaleString()}
              color="indigo"
            />
          </div>

          {/* Country List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Top Countries
            </h3>
            
            <div className="grid gap-4">
              {analytics.countries.map((country) => (
                <div
                  key={country.country}
                  className="bg-white/50 hover:bg-white/70 border border-slate-200/50 hover:border-slate-300/50 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/5 hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Country Flag and Name */}
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {getCountryFlag(country.country)}
                        </span>
                        <div>
                          <h4 className="font-semibold text-foreground">
                            {country.country}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {country.uniqueUsers} unique user{country.uniqueUsers !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      {/* Most Popular Link */}
                      <div className="flex-1 ml-8">
                        <div className="bg-slate-100/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">
                            Most clicked link:
                          </p>
                          <p className="font-medium text-foreground text-sm">
                            {country.topLinkTitle}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground">
                        {country.totalClicks.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {country.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="w-full bg-slate-200/50 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${country.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          {analytics.countries.length > 10 && (
            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                Showing top {Math.min(10, analytics.countries.length)} countries · {analytics.totalCountries} total
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CountryAnalytics;
