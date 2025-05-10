import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/app/components/footers/footer"; // 👈 import

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Guess Us",
  description: "Guessing Game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        {/* <header className="flex justify-center py-4">
          <h1
            style={{ fontFamily: 'Freckle Face, sans-serif' }}
            className="text-4xl font-bold bg-gradient-to-r from-purple-900 via-indigo-800 via-blue-800 via-green-700 via-yellow-700 to-red-700 text-transparent bg-clip-text"
          >

            Guess Us!
          </h1>
        </header> */}
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
