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
  title: "명대사 포춘쿠키 & 영화 퀴즈",
  description: "당신의 기분과 상황을 아름다운 한 줄의 영화 명대사로 바꿔보세요. 영화 명대사 O/X 팩트체크 퀴즈도 즐길 수 있습니다.",
  keywords: ["영화명대사", "포춘쿠키", "영화퀴즈", "감성글귀", "명언생성기", "AI명언", "영화추천"],
  openGraph: {
    title: "명대사 포춘쿠키 & 영화 퀴즈",
    description: "오늘 내 기분에 딱 맞는 영화 명대사는? 영화 명대사 퀴즈도 함께 즐겨보세요!",
    url: "https://xn--hz2b60w.site",
    siteName: "명대사 포춘쿠키",
    images: [
      {
        url: "https://xn--hz2b60w.site/og-image.png", // 추후 이미지를 추가할 위치
        width: 1200,
        height: 630,
        alt: "명대사 포춘쿠키 & 영화 퀴즈 썸네일",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "명대사 포춘쿠키 & 영화 퀴즈",
    description: "오늘 내 기분에 딱 맞는 영화 명대사는? 영화 명대사 퀴즈도 함께 즐겨보세요!",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1278068718279334" crossOrigin="anonymous"></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden w-full`}
      >
        {children}
      </body>
    </html>
  );
}
