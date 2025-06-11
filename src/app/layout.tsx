import type { Metadata } from "next";
import "./globals.css";
import { SocketProvider } from "@/lib/SocketProvider";
import { ConfirmDialogProvider } from "@/hooks/use-confirm-dialog";
import { Toaster } from "sonner";

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
        <SocketProvider>
          <ConfirmDialogProvider>
            {children}
            <Toaster richColors position="top-right"/>
          </ConfirmDialogProvider>
        </SocketProvider>
      </body>
    </html>
  );
}
