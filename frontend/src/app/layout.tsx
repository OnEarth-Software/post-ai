import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Post Generate AI",
  description: "Yapay zeka destekli ürün pazarlama asistanı",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
