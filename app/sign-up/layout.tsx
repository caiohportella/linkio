import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your Linkio account and start building your personalized link-in-bio page. Join thousands of creators, influencers, and professionals.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
