import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AdVantage AI',
  description: 'Turn Product Images Into AI-Powered Marketing Content',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Navbar burada olduğu için artık eklenecek her yeni sayfada otomatik görünecek */}
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
