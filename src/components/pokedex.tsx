import React, { Suspense, useState } from 'react';

import { motion } from 'framer-motion';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Filter,
  Search,
  Sparkles,
  Zap,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useQuery } from 'react-query';
import { useDebounce } from 'use-debounce';

import { fetchPokemonByType, fetchPokemonList, searchPokemon } from '@/lib/api';
import { POKEMON_TYPES } from '@/lib/constants';
import { PokemonListItem } from '@/lib/types';

import LoadingSpinner from './loading-spinner';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const LazyPokemonListCard = dynamic(() => import('./pokemon-list-card'), {
  loading: () => <SkeletonCard />,
  ssr: false,
});

const ITEMS_PER_PAGE = 24; // Good number for grid layouts

// TCG-style skeleton loading card component
const SkeletonCard: React.FC = () => (
  <motion.div
    className="w-full h-80 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/20 dark:via-yellow-900/20 dark:to-orange-900/20 rounded-2xl overflow-hidden relative shadow-xl"
    initial={{ opacity: 0, scale: 0.8, y: 40 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    }}
  >
    {/* TCG Card Border */}
    <div className="absolute inset-0 rounded-2xl border-8 border-yellow-200 dark:border-yellow-600/30 shadow-inner" />
    <div className="absolute inset-2 rounded-xl border-2 border-yellow-300/50 dark:border-yellow-500/20" />

    {/* Shimmer effect */}
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
      animate={{ x: ['-100%', '100%'] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
    />

    {/* Content skeleton */}
    <div className="relative z-10 p-4 h-full flex flex-col">
      {/* Header - Name and HP */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 space-y-2">
          <div className="h-6 bg-muted/60 rounded w-3/4 animate-pulse" />
          <div className="h-3 bg-muted/40 rounded w-1/3 animate-pulse" />
        </div>
        <div className="h-8 w-14 bg-red-200 dark:bg-red-800/50 rounded-lg animate-pulse" />
      </div>

      {/* Type symbols */}
      <div className="flex gap-2 mb-3">
        <div className="w-6 h-6 bg-muted/50 rounded-full animate-pulse" />
        <div className="w-6 h-6 bg-muted/40 rounded-full animate-pulse" />
      </div>

      {/* Artwork area */}
      <div className="relative flex-1 bg-gradient-to-b from-white/60 to-white/40 dark:from-white/10 dark:to-white/5 rounded-xl p-4 mb-3 shadow-inner border-2 border-white/30">
        <div className="relative h-full flex items-center justify-center">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-2 left-2 w-6 h-6 border border-gray-300 rounded-full" />
            <div className="absolute top-2 right-2 w-4 h-4 border border-gray-300 rounded-full" />
            <div className="absolute bottom-2 left-4 w-3 h-3 border border-gray-300 rounded-full" />
            <div className="absolute bottom-2 right-6 w-4 h-4 border border-gray-300 rounded-full" />
          </div>

          {/* Pokemon silhouette */}
          <motion.div
            className="w-32 h-32 bg-muted/40 rounded-full"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      </div>

      {/* Attack section */}
      <div className="bg-white/60 dark:bg-white/10 rounded-xl p-3 mb-3 shadow-inner border border-gray-200/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-muted/40 rounded-full animate-pulse" />
            <div className="h-3 w-16 bg-muted/50 rounded animate-pulse" />
          </div>
          <div className="h-6 w-8 bg-red-200 dark:bg-red-800/50 rounded animate-pulse" />
        </div>
        <div className="h-2 bg-muted/30 rounded w-full animate-pulse" />
      </div>

      {/* Bottom section */}
      <div className="flex justify-between items-end">
        <div className="flex gap-3">
          <div className="space-y-1">
            <div className="h-2 w-12 bg-muted/40 rounded animate-pulse" />
            <div className="h-3 w-6 bg-muted/50 rounded animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="h-2 w-12 bg-muted/40 rounded animate-pulse" />
            <div className="h-3 w-6 bg-muted/50 rounded animate-pulse" />
          </div>
        </div>
        <div className="text-right space-y-1">
          <div className="flex items-center justify-end gap-2">
            <div className="w-3 h-3 bg-muted/40 rounded-full animate-pulse" />
            <div className="h-3 w-12 bg-muted/50 rounded animate-pulse" />
          </div>
          <div className="h-2 w-8 bg-muted/30 rounded animate-pulse" />
        </div>
      </div>
    </div>
  </motion.div>
);

// Pagination component
const PaginationControls: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}> = ({ currentPage, totalPages, onPageChange, isLoading }) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 mb-8"
    >
      {/* Page Info */}
      <div className="text-sm text-muted-foreground order-2 sm:order-1">
        Page {currentPage} of {totalPages}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2 order-1 sm:order-2">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="flex items-center gap-2 hover:bg-primary/10"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {visiblePages.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-muted-foreground">...</span>
              ) : (
                <Button
                  variant={currentPage === page ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  disabled={isLoading}
                  className={`w-10 h-10 p-0 ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                      : 'hover:bg-primary/10'
                  }`}
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="flex items-center gap-2 hover:bg-primary/10"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={16} />
        </Button>
      </div>

      {/* Quick Jump (for larger datasets) */}
      {totalPages > 10 && (
        <div className="flex items-center gap-2 text-sm order-3">
          <span className="text-muted-foreground">Go to:</span>
          <Select onValueChange={(value) => onPageChange(parseInt(value))}>
            <SelectTrigger className="w-20 h-8">
              <SelectValue placeholder={currentPage.toString()} />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <SelectItem key={page} value={page.toString()}>
                    {page}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
      )}
    </motion.div>
  );
};

// Enhanced animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
      when: 'beforeChildren',
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 60,
    scale: 0.8,
    rotateX: -15,
  },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: {
      duration: 0.7,
      delay: index * 0.05,
      ease: [0.25, 0.46, 0.45, 0.94],
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  }),
};

const sparkleVariants = {
  animate: {
    scale: [0, 1, 0],
    opacity: [0, 1, 0],
    rotate: [0, 180, 360],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: 'loop' as const,
      ease: 'easeInOut',
    },
  },
};

const floatingAnimation = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Background sparkles component
const BackgroundSparkles: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }, (_, i) => (
        <motion.div
          key={i}
          className="absolute text-white/20 dark:text-white/10"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          variants={sparkleVariants}
          animate="animate"
          initial={{ scale: 0 }}
        >
          <Sparkles size={8 + Math.random() * 12} />
        </motion.div>
      ))}
    </div>
  );
};

// Floating orbs component
const FloatingOrbs: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 3 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-gradient-to-br from-white/10 to-white/5 dark:from-white/5 dark:to-white/2 backdrop-blur-sm"
          style={{
            width: `${40 + Math.random() * 30}px`,
            height: `${40 + Math.random() * 30}px`,
            left: `${Math.random() * 90}%`,
            top: `${Math.random() * 90}%`,
          }}
          variants={floatingAnimation}
          animate="animate"
          initial={{ scale: 0 }}
        />
      ))}
    </div>
  );
};

const Pokedex: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Fetch Pokemon with pagination
  const fetchPokemonPage = async () => {
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    if (debouncedSearchTerm) {
      // For search, return all results (no pagination)
      const searchResults = await searchPokemon(debouncedSearchTerm);
      return {
        results: searchResults,
        totalCount: searchResults.length,
        totalPages: 1,
        currentPage: 1,
      };
    } else if (selectedType) {
      // For type filtering with pagination
      const typeResults = await fetchPokemonByType(
        selectedType,
        offset,
        ITEMS_PER_PAGE
      );
      // Note: You might need to adjust this based on your API
      const totalCount = 1010; // Total Pokemon count (approximate)
      return {
        results: typeResults,
        totalCount,
        totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
        currentPage,
      };
    } else {
      // Regular pagination
      const listResults = await fetchPokemonList(offset, ITEMS_PER_PAGE);
      const totalCount = 1010; // Total Pokemon count (you might want to get this from API)
      return {
        results: listResults.results,
        totalCount,
        totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
        currentPage,
      };
    }
  };

  const { data, isLoading, isError, error, refetch } = useQuery(
    ['pokemon-page', debouncedSearchTerm, selectedType, currentPage],
    fetchPokemonPage,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      keepPreviousData: true, // Smooth page transitions
    }
  );

  // Reset to page 1 when search or filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedType]);

  // Scroll to top on page change
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Monitor scroll for scroll-to-top button
  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <LoadingSpinner size="lg" message="Loading Pokémon..." />
        </motion.div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-red-500 mb-4">Error loading Pokémon</p>
          <p className="text-muted-foreground mb-6">
            {error instanceof Error ? error.message : 'Something went wrong'}
          </p>
          <Button
            onClick={() => refetch()}
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
          >
            Try Again
          </Button>
        </motion.div>
      </div>
    );
  }

  const handleTypeChange = (value: string) => {
    setSelectedType(value === 'all' ? null : value);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Create skeleton cards for loading states
  const renderSkeletonCards = () =>
    Array.from({ length: ITEMS_PER_PAGE }, (_, i) => (
      <motion.div
        key={`skeleton-${i}`}
        variants={itemVariants}
        className="group"
      >
        <SkeletonCard />
      </motion.div>
    ));

  const renderPokemonList = () => {
    if (isLoading) {
      return (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {renderSkeletonCards()}
        </motion.div>
      );
    }

    if (!data?.results?.length) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="flex flex-col items-center gap-6">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Search className="w-20 h-20 text-muted-foreground/50" />
            </motion.div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-muted-foreground">
                No Pokémon found
              </p>
              <p className="text-muted-foreground max-w-md">
                Try adjusting your search or filter criteria to discover more
                Pokémon
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-2 mt-4"
            >
              <Badge variant="outline" className="text-xs">
                💡 Try searching by name
              </Badge>
              <Badge variant="outline" className="text-xs">
                🔍 Browse by type
              </Badge>
              <Badge variant="outline" className="text-xs">
                🔄 Clear filters
              </Badge>
            </motion.div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={`page-${currentPage}`} // Key change triggers re-animation
      >
        {data.results.map((pokemon: PokemonListItem, index: number) => (
          <motion.div
            key={pokemon.name}
            variants={itemVariants}
            custom={index}
            className="group"
          >
            <Suspense fallback={<SkeletonCard />}>
              <LazyPokemonListCard pokemon={pokemon} />
            </Suspense>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
        {/* Enhanced Hero Section */}
        <motion.section
          variants={itemVariants}
          className="relative text-center py-12 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 dark:from-blue-600 dark:via-purple-600 dark:to-indigo-700 rounded-2xl mb-12 shadow-2xl overflow-hidden"
        >
          {/* Enhanced background elements */}
          <BackgroundSparkles count={8} />
          <FloatingOrbs />

          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 dark:from-black/40 dark:via-transparent dark:to-black/20" />

          <div className="relative z-20">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-white px-4 font-pixel drop-shadow-lg">
                Pokédex
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg sm:text-xl mb-6 text-white/95 px-4 font-pixel drop-shadow-md"
            >
              Discover Every Pokémon Species
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap justify-center gap-3 px-4"
            >
              <Badge className="bg-white/30 backdrop-blur-sm text-white border-white/40 hover:bg-white/40 transition-all duration-300 px-3 py-1 text-sm font-semibold shadow-lg">
                ⚡ Fast Search
              </Badge>
              <Badge className="bg-white/30 backdrop-blur-sm text-white border-white/40 hover:bg-white/40 transition-all duration-300 px-3 py-1 text-sm font-semibold shadow-lg">
                🎯 Type Filtering
              </Badge>
              <Badge className="bg-white/30 backdrop-blur-sm text-white border-white/40 hover:bg-white/40 transition-all duration-300 px-3 py-1 text-sm font-semibold shadow-lg">
                📱 Mobile Ready
              </Badge>
            </motion.div>
          </div>
        </motion.section>

        {/* Enhanced Filter & Search Section */}
        <motion.section variants={itemVariants} className="mb-8">
          <Card className="overflow-hidden shadow-xl border-2 bg-card/95 backdrop-blur-sm">
            <CardContent className="p-6">
              {/* Mobile Filter Toggle */}
              <div className="md:hidden mb-4">
                <Button
                  onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                  className="w-full flex justify-between items-center bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg transition-all duration-300"
                >
                  <span className="flex items-center gap-2">
                    <Filter size={20} />
                    Filter & Search
                  </span>
                  <motion.div
                    animate={{ rotate: isFilterExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronUp size={20} />
                  </motion.div>
                </Button>
              </div>

              {/* Filter Content */}
              <motion.div
                className={`space-y-6 ${isFilterExpanded ? 'block' : 'hidden md:block'}`}
                initial={false}
                animate={{
                  height:
                    isFilterExpanded || window.innerWidth >= 768 ? 'auto' : 0,
                  opacity: isFilterExpanded || window.innerWidth >= 768 ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Search Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Search Pokémon</h3>
                  </div>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Enter Pokémon name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 text-lg border-2 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    {searchTerm && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSearchTerm('')}
                          className="w-6 h-6 p-0 rounded-full hover:bg-muted"
                        >
                          ✕
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Type Filter Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Filter by Type</h3>
                  </div>
                  <Select onValueChange={handleTypeChange}>
                    <SelectTrigger className="w-full py-3 text-lg border-2 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all duration-300">
                      <SelectValue placeholder="Select a type to filter..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      <SelectItem value="all" className="text-lg py-2">
                        <span className="flex items-center gap-2">
                          ✨ All Types
                        </span>
                      </SelectItem>
                      {POKEMON_TYPES.map((type) => (
                        <SelectItem
                          key={type}
                          value={type.toLowerCase()}
                          className="text-lg py-2"
                        >
                          <span className="flex items-center gap-2">
                            🔥 {type}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Active Filters Display */}
                {(searchTerm || selectedType) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap gap-2 pt-2 border-t border-muted"
                  >
                    <span className="text-sm font-medium text-muted-foreground">
                      Active filters:
                    </span>
                    {searchTerm && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        Search: "{searchTerm}"
                        <button
                          onClick={() => setSearchTerm('')}
                          className="ml-1 hover:text-primary"
                        >
                          ✕
                        </button>
                      </Badge>
                    )}
                    {selectedType && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        Type: {selectedType}
                        <button
                          onClick={() => setSelectedType(null)}
                          className="ml-1 hover:text-primary"
                        >
                          ✕
                        </button>
                      </Badge>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Results Section */}
        <motion.section variants={itemVariants}>
          {/* Results Count */}
          {data && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6"
            >
              <p className="text-muted-foreground text-center">
                {data.results?.length || 0} Pokémon on this page
                {searchTerm && ` for "${searchTerm}"`}
                {selectedType && ` with type "${selectedType}"`}
                {data.totalCount && ` (${data.totalCount} total)`}
              </p>
            </motion.div>
          )}

          {/* Pokemon Grid */}
          {renderPokemonList()}

          {/* Pagination Controls */}
          {data && data.totalPages > 1 && !debouncedSearchTerm && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={data.totalPages}
              onPageChange={handlePageChange}
              isLoading={isLoading}
            />
          )}
        </motion.section>
      </div>

      {/* Enhanced Scroll to Top Button */}
      {showScrollTop && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Button
            onClick={scrollToTop}
            className="w-14 h-14 rounded-full p-0 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"
          >
            <motion.div
              animate={{ y: [-2, 2, -2] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ChevronUp size={24} />
            </motion.div>
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Pokedex;
