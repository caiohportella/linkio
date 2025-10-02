"use client";

import { useState, useEffect } from "react";
import { Check, User, Link2 } from "lucide-react";
import Image from "next/image";
import QRCode from "qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { getBaseUrl, SUPPORTED_SOCIALS } from "@/lib/utils";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  profilePictureUrl?: string;
  accentColor?: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  username,
  profilePictureUrl,
  accentColor = "#082f08",
}: ShareModalProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [profileUrl, setProfileUrl] = useState("");

  useEffect(() => {
    const url = `${getBaseUrl()}/u/${username}`;
    setProfileUrl(url);

    // Generate QR code
    QRCode.toDataURL(url, {
      width: 256,
      margin: 2,
      color: {
        dark: accentColor,
        light: "#FFFFFF",
      },
    })
      .then((dataUrl) => {
        setQrCodeDataUrl(dataUrl);
      })
      .catch((err) => {
        console.error("Error generating QR code:", err);
      });
  }, [username, accentColor]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleSocialShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(profileUrl);
    const encodedText = encodeURIComponent(
      `Check out my Linkio profile: @${username}`,
    );

    let shareUrl = "";

    switch (platform) {
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case "X":
        shareUrl = `https://x.com/intent/post?text=${encodedText}%20${encodedUrl}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-sm rounded-2xl bg-card"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">
            Share Linkio
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="py-6">
          <div className="space-y-6">
            {/* Dark Profile Card */}
            <Card className="text-white rounded-2xl">
              <CardContent className="text-center py-8">
                {/* Profile Picture */}
                <div className="flex justify-center mb-4">
                  {profilePictureUrl ? (
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-white p-1">
                      <Image
                        src={profilePictureUrl}
                        alt={`${username}'s profile`}
                        width={72}
                        height={72}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                      <User className="w-10 h-10 text-gray-600" />
                    </div>
                  )}
                </div>

                {/* User Name */}
                <h3 className="text-2xl font-bold text-white mb-1">
                  @{username}
                </h3>

                {/* Profile URL */}
                <div className="flex items-center justify-center mb-4">
                  <div className="rounded-lg px-3 py-2 flex items-center">
                    <div className="w-12 h-12 rounded flex items-center justify-center">
                      <Image
                        src="/logo.png"
                        alt="Linkio logo"
                        width={200}
                        height={200}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-lg text-text">/{username}</span>
                  </div>
                </div>

                {/* QR Code */}
                {qrCodeDataUrl && (
                  <div className="flex justify-center">
                    <div className="inline-block">
                      <Image
                        src={qrCodeDataUrl}
                        alt="QR Code"
                        width={150}
                        height={150}
                        className="rounded"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Social Share Buttons */}
            <div className="flex justify-center gap-4">
              {/* Copy Link Button */}
              <button
                onClick={handleCopyLink}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 bg-gray-300 dark:bg-gray-100 hover:bg-gray-200">
                  {copied ? (
                    <Check className="w-6 h-6 text-green-600" />
                  ) : (
                    <Link2 className="w-6 h-6 text-gray-600" />
                  )}
                </div>
                <span className="text-xs text-text font-medium">
                  {copied ? "Copied!" : "Copy Linkio"}
                </span>
              </button>
              {[
                { name: "X", platform: "twitter" },
                { name: "WhatsApp", platform: "whatsapp" },
              ].map(({ name, platform }) => {
                const socialData = SUPPORTED_SOCIALS.find(
                  (s) => s.name === name,
                );
                if (!socialData) return null;

                return (
                  <button
                    key={platform}
                    onClick={() => handleSocialShare(platform)}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ backgroundColor: socialData.brandColor }}
                    >
                      <socialData.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs text-text font-medium">
                      {name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
