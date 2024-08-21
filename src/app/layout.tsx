import { Menu } from 'lucide-react';
import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import Link from 'next/link';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';

import ThemeToggle from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

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

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/pokedex', label: 'Pokédex' },
  { href: '/team-builder', label: 'Team Builder' },
  { href: '/battle', label: 'Battle' },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Document>
      <NextLoader />
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center justify-between">
            <div className="flex items-center">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="pr-0">
                  <nav className="flex flex-col space-y-3">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-2 py-1 text-lg"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
              <div className="hidden md:flex">
                <nav className="flex items-center space-x-6 text-sm font-medium">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="transition-colors hover:text-foreground/80 text-foreground"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
            <div className="flex items-center">
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
