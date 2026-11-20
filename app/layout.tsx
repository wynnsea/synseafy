import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/src/presentation/components/layout/AppShell";
import { appConfig } from "@/src/infrastructure/config/app-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#03131f" },
    { media: "(prefers-color-scheme: light)", color: "#8fd2f6" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(appConfig.appUrl),
  title: "Synseafy — Personal Liquid Music Player",
  description:
    "Personal liquid glass music player in the Wynnsea ecosystem with YouTube Music discovery.",
  applicationName: "Synseafy",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Synseafy",
  },
  icons: {
    icon: [
      { url: "/brand/logo-v3.png", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/brand/logo-v3.png" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
