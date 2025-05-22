import type { Metadata } from "next";
import "./globals.css";
import { SocketProvider } from "@/lib/SocketProvider";

export const metadata: Metadata = {
  title: "Deal Maker",
  description: "Deal Maker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-[#fafafa]">
        <SocketProvider>{children}</SocketProvider>
      </body>
    </html>
  );
}
