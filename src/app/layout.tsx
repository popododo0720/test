import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./andidea.css";

const geistSans = localFont({
  src: "../../public/sites/www-andidea-jp-f5b0a421/root-8a5edab2/geist.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});
const geistMono = localFont({
  src: "../../public/sites/www-andidea-jp-f5b0a421/root-8a5edab2/geist-mono.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});
export const metadata: Metadata = {
  title: "And Idea — Creative Intelligence Studio",
  description: "人の想像力と、AIの可能性。And Ideaは映像・アニメーション制作、技術開発、法人向けAI研修を通して、新しい表現をつくるスタジオです。",
  robots: { index: false, follow: false },
  icons: { icon: "/sites/www-andidea-jp-f5b0a421/root-8a5edab2/favicon.ico" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="andidea-site">{children}</body>
    </html>
  );
}
