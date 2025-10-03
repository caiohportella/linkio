import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Linkio - Personal Profile",
  description: "Linkio",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div>{children}</div>;
}
