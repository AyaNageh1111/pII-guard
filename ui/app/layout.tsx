import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: any = {
  title: "PII Detection Dashboard",
  description:
    "Monitor and analyze personally identifiable information across your systems",
  applicationName: "PII Detection Dashboard",
  authors: [{ name: "Your Company Name" }],
  keywords: ["PII", "security", "monitoring", "data protection", "privacy"],
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: any = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
