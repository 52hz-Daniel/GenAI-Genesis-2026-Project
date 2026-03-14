import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My badges | Aptitude AI",
  description: "View and share your soft skill badges.",
};

export default function BadgesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
