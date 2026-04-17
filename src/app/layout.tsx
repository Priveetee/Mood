import type { Metadata } from "next";
import { Josefin_Sans, Reddit_Sans, Sora } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const soria = Sora({ subsets: ["latin"], variable: "--font-soria" });
const josefinSans = Josefin_Sans({ subsets: ["latin"], variable: "--font-josefin-sans" });
const redditSans = Reddit_Sans({ subsets: ["latin"], variable: "--font-reddit-sans" });

export const metadata: Metadata = {
  title: "Mood",
  description: "Anonymous team mood polling",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${soria.variable} ${josefinSans.variable} ${redditSans.variable} font-user`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
