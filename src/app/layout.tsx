import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';

import {
  EnhancedFooter,
  EnhancedNavigation,
} from '@/components/enhanced-navigation';

import { Document } from './Document';
import { NextLoader } from './NextLoader';
import './globals.css';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'PokéDem - Your Ultimate Pokémon Companion',
  description:
    'Explore, battle, and master the world of Pokémon with our comprehensive toolkit',
  keywords: 'Pokemon, Pokedex, Team Builder, Battle Simulator, Type Calculator',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Document>
      <NextLoader />
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Enhanced Navigation */}
        <EnhancedNavigation />

        {/* Enhanced Main Content */}
        <main className="flex-1 relative">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-10 left-10 w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
            <div className="absolute top-32 right-20 w-3 h-3 bg-purple-500 rounded-full animate-pulse delay-1000" />
            <div className="absolute bottom-20 left-1/4 w-2 h-2 bg-yellow-500 rounded-full animate-pulse delay-2000" />
            <div className="absolute bottom-40 right-1/3 w-3 h-3 bg-green-500 rounded-full animate-pulse delay-500" />
          </div>

          <div className="relative z-10">{children}</div>
        </main>

        {/* Enhanced Footer */}
        <EnhancedFooter />
      </div>
    </Document>
  );
}
