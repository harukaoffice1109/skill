import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Skill 推荐网 | 精选 Agent Skills",
  description: "按类别精选 Agent Skills，提供中文介绍、推荐理由和安装入口。",
  metadataBase: new URL("https://moko-skill-directory.harukaoffice.chatgpt.site"),
  openGraph: {
    title: "Skill 推荐网",
    description: "333 个 Agent Skills，总有一个顺手。",
    type: "website",
    locale: "zh_CN",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Skill 推荐网" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Skill 推荐网",
    description: "333 个 Agent Skills，总有一个顺手。",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
