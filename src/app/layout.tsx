import type { Metadata } from "next";
import { Source_Sans_3, Lato } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { ViewCounter } from "@/components/view-counter";

const sourceSans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const lato = Lato({
  variable: "--font-heading",
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Naas",
  description: "A little bit of everything.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sourceSans.variable} ${lato.variable} font-sans antialiased min-h-screen bg-[var(--background)] text-[color:var(--foreground)]`}
      >
        <ThemeProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
          <ViewCounter />
        </ThemeProvider>
      </body>
    </html>
  );
}
