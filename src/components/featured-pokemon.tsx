import React, { useCallback, useRef, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePokemonDetails } from '@/hooks/use-pokemon-details';
import { typeColors } from '@/lib/constants';
import { PokemonStat, PokemonType } from '@/lib/types';

import LazyImage from './lazy-image';

interface FeaturedPokemonProps {
  pokemonId: number;
  showMetrics?: boolean;
  enablePrefetching?: boolean;
  showStats?: boolean;
  showEvolution?: boolean;
  enableInteractions?: boolean;
  className?: string;
}

interface SparkleProps {
  className?: string;
}

const Sparkle: React.FC<SparkleProps> = ({ className = '' }) => (
  <motion.div
    className={`absolute w-2 h-2 bg-yellow-300 dark:bg-yellow-400 rounded-full ${className}`}
    animate={{
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      rotate: [0, 180, 360],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      delay: Math.random() * 2,
    }}
  />
);

const StatBar: React.FC<{ stat: PokemonStat; showLabel?: boolean }> = ({
  stat,
  showLabel = true,
}) => {
  const statName = stat.stat.name.replace('-', ' ');
  const percentage = (stat.base_stat / 255) * 100;

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex justify-between text-xs">
          <span className="capitalize font-medium text-foreground">
            {statName}
          </span>
          <span className="font-bold text-foreground">{stat.base_stat}</span>
        </div>
      )}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <Progress
          value={percentage}
          className="h-2 bg-gray-200 dark:bg-gray-700"
        />
      </motion.div>
    </div>
  );
};

const FeaturedPokemon: React.FC<FeaturedPokemonProps> = ({
  pokemonId,
  showMetrics = false,
  enablePrefetching = true,
  showStats = true,
  showEvolution = true,
  enableInteractions = true,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const {
    pokemon: details,
    species,
    evolutionChain,
    isLoading,
    error,
    isOnline,
    metrics,
    isCached,
    lastFetched,
  } = usePokemonDetails(pokemonId, {
    prefetchRelated: enablePrefetching,
    prefetchEvolutionChain: showEvolution,
    enableMetrics: showMetrics,
    backgroundRefresh: true,
  });

  const handleCopyPokemonData = useCallback(async () => {
    if (!details) return;

    const pokemonData = {
      id: details.id,
      name: details.name,
      types: details.types.map((t) => t.type.name),
      stats: Object.fromEntries(
        details.stats.map((s) => [s.stat.name, s.base_stat])
      ),
      abilities: details.abilities.map((a) => a.ability.name),
      height: details.height / 10,
      weight: details.weight / 10,
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(pokemonData, null, 2));
      setShowCopyTooltip(true);
      setTimeout(() => setShowCopyTooltip(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [details]);

  const handleFavoriteToggle = useCallback(() => {
    setIsFavorited(!isFavorited);
    // In a real app, this would save to localStorage or API
  }, [isFavorited]);

  const cardVariants = {
    idle: {
      scale: 1,
      rotateY: 0,
      rotateX: 0,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    hover: {
      scale: 1.05,
      rotateY: 5,
      rotateX: 5,
      boxShadow:
        '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      transition: { duration: 0.3 },
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 },
    },
  };

  const loadingVariants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  if (isLoading) {
    return (
      <motion.div
        variants={loadingVariants}
        animate="animate"
        className={`min-h-[32rem] sm:min-h-[34rem] md:min-h-[36rem] ${className}`}
      >
        <Card className="h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-600">
          <CardContent className="p-4 h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 border-4 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full mx-auto"
              />
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-3/4 mx-auto" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isOnline
                  ? 'Loading Pokémon...'
                  : 'Offline - Loading from cache...'}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`min-h-[32rem] sm:min-h-[34rem] md:min-h-[36rem] ${className}`}
      >
        <Card className="h-full border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4 h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="text-red-500 dark:text-red-400 mb-2"
              >
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.div>
              <div>
                <p className="font-semibold text-red-700 dark:text-red-300">
                  Error loading Pokémon
                </p>
                {!isOnline && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    Check your internet connection
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!details) return null;

  const imageUrl =
    details.sprites.other?.['official-artwork']?.front_default ||
    details.sprites.front_default;

  const flavorText = species?.flavor_text_entries
    ?.find((entry) => entry.language.name === 'en')
    ?.flavor_text?.replace(/\f/g, ' ');

  const isLegendary = species?.is_legendary;
  const isMythical = species?.is_mythical;
  const isSpecial = isLegendary || isMythical;

  const totalStats = details.stats.reduce(
    (sum, stat) => sum + stat.base_stat,
    0
  );
  const averageStat = Math.round(totalStats / details.stats.length);

  return (
    <TooltipProvider>
      <motion.div
        ref={cardRef}
        variants={cardVariants}
        initial="idle"
        whileHover="hover"
        whileTap="tap"
        className={`min-h-[32rem] sm:min-h-[34rem] md:min-h-[36rem] ${className}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <Link href={`/pokemon/${details.id}`} passHref>
          <Card
            className={`
            h-full transition-all duration-300 overflow-hidden cursor-pointer
            border-4 ${
              isSpecial
                ? 'border-yellow-400 dark:border-yellow-500 bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30'
                : 'border-blue-400 dark:border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30'
            }
            ${isExpanded ? 'shadow-2xl' : 'shadow-lg'}
            group relative
          `}
          >
            {/* Sparkle effects for special Pokemon */}
            {isSpecial && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <Sparkle className="top-4 left-4" />
                <Sparkle className="top-8 right-8" />
                <Sparkle className="bottom-4 left-8" />
                <Sparkle className="bottom-8 right-4" />
                <Sparkle className="top-1/2 left-1/4" />
                <Sparkle className="top-1/3 right-1/3" />
              </div>
            )}

            <CardContent className="p-2 sm:p-4 h-full flex flex-col">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-2 sm:p-4 flex-grow flex flex-col space-y-2">
                {/* Header with image and badges */}
                <div className="relative h-36 sm:h-40 md:h-48 flex items-center justify-center mb-2 sm:mb-4">
                  {imageUrl && (
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <LazyImage
                        src={imageUrl}
                        alt={details.name}
                        width={120}
                        height={120}
                        className="object-contain drop-shadow-lg"
                      />
                    </motion.div>
                  )}

                  {/* Pokemon ID Badge */}
                  <Badge className="absolute top-0 left-0 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white">
                    #{details.id.toString().padStart(3, '0')}
                  </Badge>

                  {/* Special Pokemon Badge */}
                  {isSpecial && (
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute top-0 right-0"
                    >
                      <Badge className="bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-black dark:text-white font-bold">
                        {isMythical ? '✨ Mythical' : '👑 Legendary'}
                      </Badge>
                    </motion.div>
                  )}

                  {/* Status Indicators */}
                  <div className="absolute bottom-0 right-0 flex gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 dark:bg-green-400' : 'bg-red-500 dark:bg-red-400'}`}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        {isOnline ? 'Online' : 'Offline'}
                      </TooltipContent>
                    </Tooltip>

                    {isCached && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400" />
                        </TooltipTrigger>
                        <TooltipContent>Cached data</TooltipContent>
                      </Tooltip>
                    )}
                  </div>

                  {/* Metrics Badge */}
                  {showMetrics && (
                    <div className="absolute bottom-0 left-0 bg-black/70 dark:bg-black/80 text-white text-xs px-2 py-1 rounded-tr-lg">
                      {metrics.averageResponseTime}ms
                    </div>
                  )}
                </div>

                {/* Pokemon Name */}
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg sm:text-xl font-bold text-center capitalize mb-2 text-gray-800 dark:text-white"
                >
                  {details.name}
                </motion.h3>

                {/* Types */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-center gap-2 mb-2"
                >
                  {details.types.map((type: PokemonType, index) => (
                    <motion.span
                      key={type.type.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className={`px-2 py-1 rounded-full text-xs text-white font-semibold ${typeColors[type.type.name as keyof typeof typeColors]} shadow-md`}
                    >
                      {type.type.name}
                    </motion.span>
                  ))}
                </motion.div>

                {/* Main Content */}
                <div
                  className={`${
                    isSpecial
                      ? 'bg-gradient-to-br from-yellow-100 to-amber-200 dark:from-yellow-900/50 dark:to-amber-900/50'
                      : 'bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/50 dark:to-indigo-900/50'
                  } p-2 sm:p-3 rounded-lg flex-grow`}
                >
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-2 sm:p-3 space-y-2 h-full flex flex-col">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                      <div>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          Ability:
                        </span>
                        <p className="capitalize text-foreground">
                          {details.abilities[0]?.ability.name}
                        </p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          Height:
                        </span>
                        <p className="text-foreground">
                          {details.height / 10} m
                        </p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          Weight:
                        </span>
                        <p className="text-foreground">
                          {details.weight / 10} kg
                        </p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          Avg Stat:
                        </span>
                        <p className="font-bold text-foreground">
                          {averageStat}
                        </p>
                      </div>
                    </div>

                    {/* Generation and Habitat */}
                    {species && (
                      <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                        <div>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            Gen:
                          </span>
                          <p className="uppercase text-foreground">
                            {species.generation.name.replace('generation-', '')}
                          </p>
                        </div>
                        {species.habitat && (
                          <div>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                              Habitat:
                            </span>
                            <p className="capitalize text-foreground">
                              {species.habitat.name}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quick Stats Preview */}
                    {showStats && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ delay: 0.5 }}
                        className="space-y-1"
                      >
                        <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Quick Stats
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          {details.stats.slice(0, 4).map((stat, index) => (
                            <div key={stat.stat.name} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="capitalize text-foreground">
                                  {stat.stat.name.replace('-', ' ').slice(0, 3)}
                                </span>
                                <span className="font-bold text-foreground">
                                  {stat.base_stat}
                                </span>
                              </div>
                              <Progress
                                value={(stat.base_stat / 255) * 100}
                                className="h-1"
                              />
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Flavor Text */}
                    {flavorText && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 italic"
                      >
                        "{flavorText}"
                      </motion.p>
                    )}

                    {/* Action Buttons */}
                    {enableInteractions && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="flex gap-2 pt-2"
                        onClick={(e) => e.preventDefault()}
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant={isFavorited ? 'default' : 'outline'}
                              onClick={handleFavoriteToggle}
                              className="flex-1 text-xs"
                            >
                              {isFavorited ? '❤️' : '🤍'}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isFavorited
                              ? 'Remove from favorites'
                              : 'Add to favorites'}
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCopyPokemonData}
                              className="flex-1 text-xs"
                            >
                              📋
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {showCopyTooltip ? 'Copied!' : 'Copy Pokemon data'}
                          </TooltipContent>
                        </Tooltip>
                      </motion.div>
                    )}

                    {/* Data freshness indicator */}
                    {lastFetched && (
                      <div className="mt-auto pt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-border">
                        <span className="flex items-center gap-1">
                          {isCached ? '💾' : '🔄'}{' '}
                          {isCached ? 'Cached' : 'Fresh'}
                        </span>
                        {showMetrics && (
                          <span>
                            {Math.round((Date.now() - lastFetched) / 1000)}s ago
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    </TooltipProvider>
  );
};

export default FeaturedPokemon;
