"use client";

import Navbar from "@/components/layout/Navbar";
import { Geist, Geist_Mono } from "next/font/google";
import { ReactNode } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: // session,
Readonly<{
  children: ReactNode;
  // session?: any;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* <SessionProvider session={session}> */}
        <div className="mx-auto max-w-screen-lg h-screen flex flex-col">
          <Navbar />
          <div className="flex-grow">{children}</div>
        </div>
        {/* </SessionProvider> */}
      </body>
    </html>
  );
}
