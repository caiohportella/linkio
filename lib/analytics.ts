import {
  AnalyticsData,
  ClientTrackingData,
  LinkAnalyticsData,
  TinybirdCountryAnalyticsRow,
  TinybirdLinkAnalyticsRow,
} from "./types";

export async function trackLinkClick(e: ClientTrackingData) {
  try {
    const trackingData = {
      profileUsername: e.profileUsername,
      linkId: e.linkId,
      linkTitle: e.linkTitle,
      linkUrl: e.linkUrl,
      userAgent: e.userAgent || navigator.userAgent,
      referrer: e.referrer || document.referrer || "direct",
    };

    ("Link click tracked:", trackingData);

    await fetch("/api/track-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trackingData),
    });

    return trackingData;
  } catch (err) {
    console.error("Failed to track link click: ", err);
  }
}

export async function fetchAnalytics(
  userId: string,
  daysBack: number = 30,
): Promise<AnalyticsData> {
  if (!process.env.TINYBIRD_TOKEN || !process.env.TINYBIRD_HOST) {
    return {
      totalClicks: 0,
      uniqueVisitors: 0,
      countriesReached: 0,
      totalLinksClicked: 0,
      topLinkTitle: null,
      topReferrer: null,
      firstClick: null,
      lastClick: null,
    };
  }

  try {
    const tinybirdRes = await fetch(
      `${process.env.TINYBIRD_HOST}/v0/pipes/profile_summary.json?profileUserId=${userId}&days_back=${daysBack}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TINYBIRD_TOKEN}`,
        },
        next: { revalidate: 0 },
      },
    );

    if (!tinybirdRes.ok) {
      console.error("Tinybird request failed:", await tinybirdRes.text());
      throw new Error("Filed to fetch analytics");
    }

    const data = await tinybirdRes.json();

    if (!data.data || data.data.length === 0) {
      return {
        totalClicks: 0,
        uniqueVisitors: 0,
        countriesReached: 0,
        totalLinksClicked: 0,
        topLinkTitle: null,
        topReferrer: null,
        firstClick: null,
        lastClick: null,
      };
    }

    const analytics = data.data[0];

    return {
      totalClicks: analytics.total_clicks || 0,
      uniqueVisitors: analytics.unique_users || 0,
      countriesReached: analytics.countries_reached || 0,
      totalLinksClicked: analytics.total_links_clicked || 0,
      topLinkTitle: analytics.top_link_title?.[0] || null,
      topReferrer: analytics.top_referrer?.[0] || null,
      firstClick: analytics.first_click || null,
      lastClick: analytics.last_click || null,
    };
  } catch (err) {
    console.error("Tinybird error:", err);
    return {
      totalClicks: 0,
      uniqueVisitors: 0,
      countriesReached: 0,
      totalLinksClicked: 0,
      topLinkTitle: null,
      topReferrer: null,
      firstClick: null,
      lastClick: null,
    };
  }
}

export async function fetchLinkAnalytics(
  userId: string,
  linkId: string,
  daysBack: number = 30,
): Promise<LinkAnalyticsData | null> {
  if (!process.env.TINYBIRD_TOKEN || !process.env.TINYBIRD_HOST) {
    return {
      linkId,
      linkTitle: "Sample Link",
      linkUrl: "https://www.example.com",
      totalClicks: 0,
      uniqueUsers: 0,
      countriesReached: 0,
      dailyData: [],
      countryData: [],
    };
  }

  try {
    let tinybirdRes = await fetch(
      `${process.env.TINYBIRD_HOST}/v0/pipes/fast_link_analytics.json?profileUserId=${userId}&linkId=${linkId}&days_back=${daysBack}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TINYBIRD_TOKEN}`,
        },
        next: { revalidate: 0 },
      },
    );

    if (!tinybirdRes.ok) {
      ("Fast link analytics failed, falling back to the original");

      tinybirdRes = await fetch(
        `${process.env.TINYBIRD_HOST}/v0/pipes/link_analytics.json?profileUserId=${userId}&linkId=${linkId}&days_back=${daysBack}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.TINYBIRD_TOKEN}`,
          },
          next: { revalidate: 0 },
        },
      );
    }

    if (!tinybirdRes.ok) {
      console.error("Tinybird request failed:", await tinybirdRes.text());
      throw new Error("Failed to fetch link analytics");
    }

    const data = await tinybirdRes.json();

    if (!data.data || data.data.length === 0) {
      return null;
    }

    const dailyData = data.data.map((row: TinybirdLinkAnalyticsRow) => ({
      date: row.date,
      clicks: row.total_clicks || 0,
      uniqueUsers: row.unique_users || 0,
      countries: row.countries_reached || 0,
    }));

    const totalClicks = dailyData.reduce(
      (sum: number, day: { clicks: number }) => sum + day.clicks,
      0,
    );

    const uniqueUsers = Math.max(
      ...dailyData.map((day: { uniqueUsers: number }) => day.uniqueUsers),
      0,
    );

    const countriesReached = Math.max(
      ...dailyData.map((day: { countries: number }) => day.countries),
      0,
    );

    const firstRow = data.data[0] as TinybirdLinkAnalyticsRow;

    let countryData: Array<{
      country: string;
      clicks: number;
      percentage: number;
    }> = [];

    try {
      const countryRes = await fetch(
        `${process.env.TINYBIRD_HOST}/v0/pipes/link_country_analytics.json?profileUserId=${userId}&linkId=${linkId}&days_back=${daysBack}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.TINYBIRD_TOKEN}`,
          },
          next: { revalidate: 0 },
        },
      );

      if (countryRes.ok) {
        const countryResult = await countryRes.json();

        if (countryResult.data && countryResult.data.length > 0) {
          countryData = countryResult.data.map(
            (row: TinybirdCountryAnalyticsRow) => ({
              country: row.country || "Unknown",
              clicks: row.total_clicks || 0,
              percentage: row.percentage || 0,
            }),
          );
        }
      }
    } catch (err) {
      console.error("Failed to fetch country data:", err);
    }

    return {
      linkId,
      linkTitle: firstRow.linkTitle || "Unknown Link",
      linkUrl: firstRow.linkUrl || "",
      totalClicks,
      uniqueUsers,
      countriesReached,
      dailyData: dailyData.reverse(), //most recent first
      countryData,
    };
  } catch (err) {
    console.error("Tinybird error", err);

    return null;
  }
}

export interface CountryAnalyticsData {
  country: string;
  totalClicks: number;
  uniqueUsers: number;
  percentage: number;
  topLinkTitle: string;
  topLinkId: string;
}

export interface ProfileCountryAnalytics {
  countries: CountryAnalyticsData[];
  totalCountries: number;
  totalClicks: number;
}

export async function fetchProfileCountryAnalytics(
  userId: string,
  daysBack: number = 30,
): Promise<ProfileCountryAnalytics> {
  if (!process.env.TINYBIRD_TOKEN || !process.env.TINYBIRD_HOST) {
    return {
      countries: [],
      totalCountries: 0,
      totalClicks: 0,
    };
  }

  try {
    // Get country-level analytics for the entire profile
    const countryRes = await fetch(
      `${process.env.TINYBIRD_HOST}/v0/pipes/profile_country_analytics.json?profileUserId=${userId}&days_back=${daysBack}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TINYBIRD_TOKEN}`,
        },
        next: { revalidate: 0 },
      },
    );

    if (!countryRes.ok) {
      console.error(
        "Failed to fetch country analytics:",
        await countryRes.text(),
      );
      return {
        countries: [],
        totalCountries: 0,
        totalClicks: 0,
      };
    }

    const data = await countryRes.json();

    if (!data.data || data.data.length === 0) {
      return {
        countries: [],
        totalCountries: 0,
        totalClicks: 0,
      };
    }

    const countries = data.data.map(
      (row: {
        country?: string;
        total_clicks?: number;
        unique_users?: number;
        percentage?: number;
        top_link_title?: string;
        top_link_id?: string;
      }) => ({
        country: row.country || "Unknown",
        totalClicks: row.total_clicks || 0,
        uniqueUsers: row.unique_users || 0,
        percentage: row.percentage || 0,
        topLinkTitle: row.top_link_title || "Unknown Link",
        topLinkId: row.top_link_id || "",
      }),
    );

    const totalClicks = countries.reduce(
      (sum: number, country: CountryAnalyticsData) => sum + country.totalClicks,
      0,
    );

    return {
      countries,
      totalCountries: countries.length,
      totalClicks,
    };
  } catch (err) {
    console.error("Tinybird error:", err);
    return {
      countries: [],
      totalCountries: 0,
      totalClicks: 0,
    };
  }
}
