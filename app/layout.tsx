import "./globals.css";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import SmoothScroll from "@/components/SmoothScroll";

export const metadata: Metadata = {
  title: "Gouthami V — Computer Science & AI",
  description:
    "AI & Software Engineer building intelligent digital products. Expertise in Python, Machine Learning, NLP, and full-stack development.",
  keywords: [
    "Gouthami V",
    "AI Engineer",
    "Machine Learning",
    "Full Stack Developer",
    "Python",
    "React",
    "NLP",
    "Portfolio",
  ],
  authors: [{ name: "Gouthami V" }],
  creator: "Gouthami V",
  openGraph: {
    title: "Gouthami V — Computer Science & AI",
    description: "Computer Science Engineering student with hands-on experience in AI, Machine Learning, and Mobile Development.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
    >
      <body className="bg-[#030014] text-white min-h-screen font-sans">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
