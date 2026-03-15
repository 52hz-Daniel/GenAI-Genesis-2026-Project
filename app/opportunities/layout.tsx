import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Opportunities | Aptitude AI",
  description: "Opportunities matched to your profile and practice. See why you’re ready and take action.",
};

export default function OpportunitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
