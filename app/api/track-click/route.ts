import { api } from "@/convex/_generated/api";
import { getClient } from "@/convex/client";
import { ClientTrackingData, ServerTrackingEvent } from "@/lib/types";
import { geolocation } from "@vercel/functions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data: ClientTrackingData = await req.json();
    const geo = geolocation(req);
    const convex = getClient();

    const userId = await convex.query(api.lib.usernames.getUserIdBySlug, {
      slug: data.profileUsername,
    });

    if (!userId)
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const trackingEvent: ServerTrackingEvent = {
      ...data,
      timestamp: new Date().toISOString(),
      profileUserId: userId,
      location: {
        ...geo,
      },
      userAgent: data.userAgent || req.headers.get("user-agents") || "unknown",
    };

    if (process.env.TINYBIRD_TOKEN && process.env.TINYBIRD_HOST) {
      try {
        const eventForTinybird = {
          timestamp: trackingEvent.timestamp,
          profileUsername: trackingEvent.profileUsername,
          profileUserId: trackingEvent.profileUserId,
          linkId: trackingEvent.linkId,
          linkTitle: trackingEvent.linkTitle,
          linkUrl: trackingEvent.linkUrl,
          userAgent: trackingEvent.userAgent,
          referrer: trackingEvent.referrer,
          location: {
            country: trackingEvent.location.country || "Unknown",
            region: trackingEvent.location.region || "Unknown",
            city: trackingEvent.location.city || "Unknown",
            latitude: trackingEvent.location.latitude?.toString() || "",
            longitude: trackingEvent.location.longitude?.toString() || "",
          },
        };

        console.log(
          "Sending event to Tinybird:",
          JSON.stringify(eventForTinybird, null, 2),
        );

        const tinybirdResponse = await fetch(
          `${process.env.TINYBIRD_HOST}/v0/events?name=link_clicks`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.TINYBIRD_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(eventForTinybird),
          },
        );

        if (!tinybirdResponse.ok) {
          const errorText = await tinybirdResponse.text();
          console.error("Failed to send to Tinybird:", errorText);
        } else {
          const resBody = await tinybirdResponse.json();
          console.log("Successfully sent to Tinybird", resBody);

          if (resBody.quarentined_rows > 0) {
            console.warn("Some rows were quarentined:", resBody);
          }
        }
      } catch (err) {
        console.error("Tinybird request failed:", err);
      }
    } else {
      console.log("Tinybird not configured - event logged only");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking click:", error);
    return NextResponse.json(
      {
        error: "Failed to track click",
      },
      { status: 500 },
    );
  }
}
