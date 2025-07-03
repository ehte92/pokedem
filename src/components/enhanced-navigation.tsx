'use client';

import {
  Book,
  Home,
  Menu,
  Play,
  Sparkles,
  Swords,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import ThemeToggle from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const navItems = [
  {
    href: '/',
    label: 'Home',
    icon: Home,
    description: 'Welcome to PokéDem',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    href: '/pokedex',
    label: 'Pokédex',
    icon: Book,
    description: 'Comprehensive Pokemon database',
    color: 'from-green-500 to-emerald-500',
  },
  {
    href: '/team-builder',
    label: 'Team Builder',
    icon: Users,
    description: 'Create your perfect team',
    color: 'from-purple-500 to-pink-500',
  },
  {
    href: '/battle',
    label: 'Battle',
    icon: Swords,
    description: 'Battle simulator',
    color: 'from-red-500 to-orange-500',
  },
  {
    href: '/moves',
    label: 'Moves',
    icon: Play,
    description: 'Pokemon moves database',
    color: 'from-yellow-500 to-amber-500',
  },
];

// Logo component
const Logo = () => (
  <Link href="/" className="flex items-center space-x-2 group">
    <div className="relative">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
        <Zap className="w-6 h-6 text-white" />
      </div>
      {/* Animated sparkle */}
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping opacity-75" />
    </div>
    <div className="hidden sm:block">
      <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-600 bg-clip-text text-transparent font-pixel">
        PokéDem
      </span>
    </div>
  </Link>
);

// Navigation link component
const NavLink = ({
  item,
  isMobile = false,
}: {
  item: (typeof navItems)[0];
  isMobile?: boolean;
}) => {
  const pathname = usePathname();
  const isActive = pathname === item.href;

  if (isMobile) {
    return (
      <Link
        href={item.href}
        className={`group flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
          isActive
            ? 'bg-primary/10 border-l-4 border-primary shadow-sm dark:bg-primary/20'
            : 'hover:bg-muted/50 hover:translate-x-1 dark:hover:bg-muted/30'
        }`}
      >
        <div
          className={`p-2 rounded-lg bg-gradient-to-br ${item.color} shadow-sm group-hover:shadow-md transition-all duration-200`}
        >
          <item.icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <div
            className={`font-semibold ${isActive ? 'text-primary' : 'text-foreground'}`}
          >
            {item.label}
          </div>
          <div className="text-xs text-muted-foreground">
            {item.description}
          </div>
        </div>
        {isActive && (
          <Badge
            variant="secondary"
            className="ml-auto text-xs bg-primary/20 text-primary border-primary/30"
          >
            Active
          </Badge>
        )}
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 group ${
        isActive
          ? 'bg-primary/10 text-primary shadow-sm dark:bg-primary/20'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:hover:bg-muted/30'
      }`}
    >
      <item.icon className="w-4 h-4" />
      <span className="font-medium">{item.label}</span>

      {/* Active indicator */}
      {isActive && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
      )}

      {/* Hover effect */}
      <div
        className={`absolute inset-0 rounded-lg bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 dark:group-hover:opacity-15 transition-opacity duration-200`}
      />
    </Link>
  );
};

// Enhanced mobile menu content
const MobileMenu = () => (
  <div className="flex flex-col h-full">
    <SheetHeader className="text-left pb-6 border-b border-border">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 flex items-center justify-center shadow-lg">
          <Zap className="w-7 h-7 text-white" />
        </div>
        <div>
          <SheetTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-600 bg-clip-text text-transparent font-pixel">
            PokéDem
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            Your Pokémon Companion
          </p>
        </div>
      </div>
    </SheetHeader>

    <nav className="flex-1 py-6 space-y-2">
      {navItems.map((item) => (
        <NavLink key={item.href} item={item} isMobile={true} />
      ))}
    </nav>

    {/* Footer section in mobile menu */}
    <div className="pt-6 border-t border-border">
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="outline" className="text-xs border-muted-foreground/30">
          <Sparkles className="w-3 h-3 mr-1" />
          Enhanced Experience
        </Badge>
        <Badge variant="outline" className="text-xs border-muted-foreground/30">
          🎮 Interactive
        </Badge>
        <Badge variant="outline" className="text-xs border-muted-foreground/30">
          📱 Mobile Ready
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        Explore, battle, and become the very best Pokémon trainer!
      </p>
    </div>
  </div>
);

// Main Enhanced Navigation Component
export const EnhancedNavigation = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm dark:shadow-lg">
      <div className="container flex h-16 items-center justify-between">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center space-x-8">
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            {navItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>
        </div>

        {/* Right side - Theme Toggle and Mobile Menu */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden relative p-2 hover:bg-muted/50 dark:hover:bg-muted/30 transition-colors"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
                {/* Animated indicator dot */}
                <div className="absolute top-1 right-1 w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 rounded-full animate-pulse" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-80 p-0 bg-background/95 backdrop-blur-xl dark:bg-background/90"
            >
              <div className="p-6 h-full">
                <MobileMenu />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

// Enhanced Footer Component
export const EnhancedFooter = () => {
  return (
    <footer className="border-t bg-muted/30 backdrop-blur-sm dark:bg-muted/20 dark:border-border">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 flex items-center justify-center shadow-md">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">PokéDem</p>
              <p className="text-xs text-muted-foreground">
                Your Ultimate Pokémon Companion
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant="outline"
              className="text-xs border-muted-foreground/30"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Enhanced
            </Badge>
            <Badge
              variant="outline"
              className="text-xs border-muted-foreground/30"
            >
              ⚡ Fast
            </Badge>
            <Badge
              variant="outline"
              className="text-xs border-muted-foreground/30"
            >
              🎯 Interactive
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground text-center md:text-right">
            © 2024 PokéDem. Built with ❤️ for Pokémon trainers everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
};
