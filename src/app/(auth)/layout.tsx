export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <section className="flex min-h-screen bg-[#fafafa] px-4 py-16 md:py-32 dark:bg-transparent">{children}</section>;
}
