import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import Link from 'next/link';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';

import ThemeToggle from '@/components/theme-toggle';

import { Document } from './Document';
import { NextLoader } from './NextLoader';
import './globals.css';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Pokémon App',
  description: 'Explore the world of Pokémon',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Document>
      <NextLoader />
      <div className="flex flex-col min-h-screen">
        <header className="bg-white dark:bg-gray-800 shadow-md">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center">
              <nav className="flex-grow">
                <ul className="flex space-x-6">
                  <li>
                    <Link
                      href="/"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors text-sm"
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/pokedex"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors text-sm"
                    >
                      Pokédex
                    </Link>
                  </li>
                  {/* Add more navigation items here as needed */}
                </ul>
              </nav>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </Document>
  );
}
