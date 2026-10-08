import type { Metadata } from "next";

// Account pages: never indexed (robots.txt also disallows them).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-brand-background">{children}</div>
  );
}
