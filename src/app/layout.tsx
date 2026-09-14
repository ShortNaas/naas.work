import type { Metadata } from "next";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { GoatCounter } from "@/components/goatcounter";

export const metadata: Metadata = {
  title: "Naas",
  description: "A little bit of everything.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Browser extensions (LanguageTool writes `data-lt-installed`) add attributes
  // to <html> before React hydrates, which produces a hydration mismatch that
  // cannot be patched. React honours this flag only one level deep, which is
  // exactly this element, so it does not mask mismatches inside the app tree.
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-[var(--background)] text-[color:var(--foreground)]">
        <LayoutWrapper>{children}</LayoutWrapper>
        <GoatCounter />
      </body>
    </html>
  );
}
