import { NextRequest, NextResponse } from "next/server";

/**
 * Spotify Preview API
 *
 * Required environment variables:
 * - SPOTIFY_CLIENT_ID: Your Spotify app client ID
 * - SPOTIFY_CLIENT_SECRET: Your Spotify app client secret
 *
 * Get these from: https://developer.spotify.com/dashboard
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const trackId = searchParams.get("trackId");

  if (!trackId) {
    return NextResponse.json(
      { error: "Track ID is required" },
      { status: 400 },
    );
  }

  try {
    // Get Spotify access token
    const tokenResponse = await fetch(
      "https://accounts.spotify.com/api/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
          ).toString("base64")}`,
        },
        body: "grant_type=client_credentials",
      },
    );

    if (!tokenResponse.ok) {
      throw new Error("Failed to get Spotify access token");
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get track details
    const trackResponse = await fetch(
      `https://api.spotify.com/v1/tracks/${trackId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!trackResponse.ok) {
      throw new Error("Failed to get track details");
    }

    const trackData = await trackResponse.json();

    if (!trackData.preview_url) {
      return NextResponse.json(
        { error: "No preview available for this track" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      previewUrl: trackData.preview_url,
      trackName: trackData.name,
      artistName: trackData.artists[0]?.name,
    });
  } catch (error) {
    console.error("Spotify preview error:", error);
    return NextResponse.json(
      { error: "Failed to fetch preview" },
      { status: 500 },
    );
  }
}
