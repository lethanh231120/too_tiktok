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
  title: "TikTok Video Generator - Sora Automation Tool",
  description: "Phần mềm tự động hóa quy trình tạo video TikTok Affiliate bằng công nghệ Sora AI và Google Gemini. Nhanh chóng, tự động, và hiệu quả.",
  keywords: [
    "Sora",
    "TikTok Automation",
    "TikTok Affiliate",
    "AI Video Generator",
    "OpenAI Sora",
    "Gemini AI",
    "Tạo video AI"
  ],
  openGraph: {
    title: "TikTok Video Generator - Sora Automation",
    description: "Ứng dụng desktop hoàn hảo cho tiếp thị liên kết TikTok. Tự động hóa phân tích sản phẩm, tạo kịch bản AI, và render video với Sora.",
    url: "https://vuluu2k.github.io/tiktok_affiliate_tool", // Thay bằng domain thật nếu có
    siteName: "TikTok Gen Video",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TikTok Video Generator - Sora Automation Tool",
    description: "Tự động hóa quy trình tạo video TikTok Affiliate bằng công nghệ Sora AI và Google Gemini.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      >
        {children}
      </body>
    </html>
  );
}
