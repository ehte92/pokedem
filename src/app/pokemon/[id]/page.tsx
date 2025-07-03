'use client';

import React, { useEffect, useState } from 'react';

import * as Tooltip from '@radix-ui/react-tooltip';
import {
  Activity,
  ArrowLeft,
  ArrowLeftCircle,
  ArrowRight,
  Clock,
  Crown,
  Database,
  Egg,
  Heart,
  Home,
  Ruler,
  Star,
  Target,
  TrendingUp,
  Users,
  Weight,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from 'react-query';

import EvolutionChainComponent from '@/components/evolution-chain';
import LoadingSpinner from '@/components/loading-spinner';
import ToggleSwitch from '@/components/toggle-switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePokemonDetails } from '@/hooks/use-pokemon-details';
import { fetchAbilityDetails, fetchPokemonList } from '@/lib/api';
import { typeColors } from '@/lib/constants';
import { AbilityDetails, PokemonListItem } from '@/lib/types';

// Type effectiveness data
const typeEffectiveness = {
  normal: { weaknesses: ['fighting'], strengths: [] },
  fire: {
    weaknesses: ['water', 'ground', 'rock'],
    strengths: ['grass', 'ice', 'bug', 'steel'],
  },
  water: {
    weaknesses: ['electric', 'grass'],
    strengths: ['fire', 'ground', 'rock'],
  },
  electric: { weaknesses: ['ground'], strengths: ['water', 'flying'] },
  grass: {
    weaknesses: ['fire', 'ice', 'poison', 'flying', 'bug'],
    strengths: ['water', 'ground', 'rock'],
  },
  ice: {
    weaknesses: ['fire', 'fighting', 'rock', 'steel'],
    strengths: ['grass', 'ground', 'flying', 'dragon'],
  },
  fighting: {
    weaknesses: ['flying', 'psychic', 'fairy'],
    strengths: ['normal', 'ice', 'rock', 'dark', 'steel'],
  },
  poison: { weaknesses: ['ground', 'psychic'], strengths: ['grass', 'fairy'] },
  ground: {
    weaknesses: ['water', 'grass', 'ice'],
    strengths: ['fire', 'electric', 'poison', 'rock', 'steel'],
  },
  flying: {
    weaknesses: ['electric', 'ice', 'rock'],
    strengths: ['grass', 'fighting', 'bug'],
  },
  psychic: {
    weaknesses: ['bug', 'ghost', 'dark'],
    strengths: ['fighting', 'poison'],
  },
  bug: {
    weaknesses: ['fire', 'flying', 'rock'],
    strengths: ['grass', 'psychic', 'dark'],
  },
  rock: {
    weaknesses: ['water', 'grass', 'fighting', 'ground', 'steel'],
    strengths: ['fire', 'ice', 'flying', 'bug'],
  },
  ghost: { weaknesses: ['ghost', 'dark'], strengths: ['psychic', 'ghost'] },
  dragon: { weaknesses: ['ice', 'dragon', 'fairy'], strengths: ['dragon'] },
  dark: {
    weaknesses: ['fighting', 'bug', 'fairy'],
    strengths: ['psychic', 'ghost'],
  },
  steel: {
    weaknesses: ['fire', 'fighting', 'ground'],
    strengths: ['ice', 'rock', 'fairy'],
  },
  fairy: {
    weaknesses: ['poison', 'steel'],
    strengths: ['fighting', 'dragon', 'dark'],
  },
};

const PokemonDetailPage = () => {
  const { id } = useParams();
  const pokemonName = Array.isArray(id) ? id[0] : id;
  const [selectedGen, setSelectedGen] = useState<string>('red');
  const [prevPokemon, setPrevPokemon] = useState<PokemonListItem | null>(null);
  const [nextPokemon, setNextPokemon] = useState<PokemonListItem | null>(null);
  const [isShiny, setIsShiny] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);

  // Enhanced Pokemon details hook with all new features
  const {
    pokemon,
    species,
    evolutionChain,
    isLoading,
    isLoadingSpecies,
    isLoadingEvolution,
    isRefetching,
    error,
    speciesError,
    evolutionError,
    isOnline,
    metrics,
    isCached,
    lastFetched,
    refetch,
    prefetchRelated,
    clearCache,
  } = usePokemonDetails(parseInt(pokemonName) || 0, {
    prefetchRelated: true,
    prefetchEvolutionChain: true,
    enableMetrics: true,
    backgroundRefresh: true,
    retryOnOffline: true,
    ttl: 600000, // 10 minutes for detail pages
  });

  const { data: allPokemon } = useQuery<PokemonListItem[]>(
    'allPokemon',
    async () => {
      const response = await fetchPokemonList(0, 1000);
      return response.results;
    }
  );

  const mainAbility = pokemon?.abilities.find((a) => !a.is_hidden)?.ability;

  const { data: abilityDetails, isLoading: isAbilityLoading } =
    useQuery<AbilityDetails>(
      ['abilityDetails', mainAbility?.name],
      () =>
        mainAbility
          ? fetchAbilityDetails(mainAbility.name)
          : Promise.resolve({ effect_entries: [] }),
      { enabled: !!mainAbility }
    );

  useEffect(() => {
    if (species) {
      const hasRedVersion = species.flavor_text_entries.some(
        (entry) => entry.version.name === 'red'
      );
      setSelectedGen(hasRedVersion ? 'red' : 'latest');
    }
  }, [species]);

  useEffect(() => {
    if (allPokemon && pokemon) {
      const currentIndex = allPokemon.findIndex((p) => p.name === pokemon.name);
      if (currentIndex > 0) {
        setPrevPokemon(allPokemon[currentIndex - 1]);
      } else {
        setPrevPokemon(null);
      }
      if (currentIndex < allPokemon.length - 1) {
        setNextPokemon(allPokemon[currentIndex + 1]);
      } else {
        setNextPokemon(null);
      }
    }
  }, [allPokemon, pokemon]);

  // Auto-prefetch related Pokemon when data loads
  useEffect(() => {
    if (pokemon) {
      prefetchRelated();
    }
  }, [pokemon, prefetchRelated]);

  if (isLoading || isLoadingSpecies || isLoadingEvolution) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <LoadingSpinner size="lg" message="Loading Pokémon details..." />

          {/* Enhanced loading info */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-center space-x-2">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isOnline ? 'Connected' : 'Offline - Using cached data'}
              </span>
            </div>

            {showMetrics && (
              <div className="text-xs text-gray-500 space-y-1">
                <p>API Requests: {metrics.requestCount}</p>
                <p>Cache Hits: {metrics.cacheHits}</p>
                <p>Avg Response: {Math.round(metrics.averageResponseTime)}ms</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (error || speciesError || evolutionError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <div className="text-red-500 mb-4">
            <Activity className="w-16 h-16 mx-auto mb-4" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Error Loading Pokémon</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error?.message || speciesError?.message || evolutionError?.message}
          </p>

          {!isOnline && (
            <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-center space-x-2 text-yellow-800 dark:text-yellow-200">
                <WifiOff className="w-5 h-5" />
                <span>You're currently offline</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Button onClick={refetch} disabled={isRefetching}>
              {isRefetching ? 'Retrying...' : 'Try Again'}
            </Button>
            <Button variant="outline" onClick={clearCache}>
              Clear Cache & Retry
            </Button>
            <Link href="/pokedex">
              <Button variant="ghost">Back to Pokédex</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const calculateTypeEffectiveness = (types: string[]) => {
    let weaknesses = new Set<string>();
    let strengths = new Set<string>();

    types.forEach((type) => {
      (
        typeEffectiveness as {
          [key: string]: { weaknesses: string[]; strengths: string[] };
        }
      )[type.toLowerCase()]?.weaknesses.forEach((w) => weaknesses.add(w));
      (
        typeEffectiveness as {
          [key: string]: { weaknesses: string[]; strengths: string[] };
        }
      )[type.toLowerCase()]?.strengths.forEach((s) => strengths.add(s));
    });

    // Remove types that appear in both weaknesses and strengths
    const finalWeaknesses = Array.from(weaknesses).filter(
      (w) => !strengths.has(w)
    );
    const finalStrengths = Array.from(strengths).filter(
      (s) => !weaknesses.has(s)
    );

    return { weaknesses: finalWeaknesses, strengths: finalStrengths };
  };

  if (!pokemon || !species) return null;

  const getDescription = () => {
    if (!species?.flavor_text_entries.length)
      return 'No description available.';

    if (selectedGen === 'latest') {
      return species.flavor_text_entries[species.flavor_text_entries.length - 1]
        .flavor_text;
    }

    const genDescription = species.flavor_text_entries.find(
      (entry) => entry.version.name === selectedGen
    );
    return genDescription
      ? genDescription.flavor_text
      : 'No description available for this generation.';
  };

  const availableGens = species
    ? Array.from(
        new Set(species.flavor_text_entries.map((entry) => entry.version.name))
      )
    : [];

  const getAbilityDescription = () => {
    if (isAbilityLoading) return 'Loading ability description...';
    if (!abilityDetails) return 'No ability description available.';
    return (
      abilityDetails.effect_entries.find(
        (entry) => entry.language.name === 'en'
      )?.short_effect || 'No English description available.'
    );
  };

  // Helper function to calculate gender ratio
  const getGenderRatio = (rate: number | undefined) => {
    if (rate === undefined || rate === -1) return 'Genderless';
    const femaleRatio = (rate / 8) * 100;
    return `${femaleRatio}% Female, ${100 - femaleRatio}% Male`;
  };

  const { weaknesses, strengths } = calculateTypeEffectiveness(
    pokemon.types.map((t) => t.type.name)
  );

  const getImageUrl = () => {
    if (isShiny) {
      return (
        pokemon.sprites.other['official-artwork'].front_shiny ||
        pokemon.sprites.front_shiny ||
        pokemon.sprites.other['official-artwork'].front_default ||
        pokemon.sprites.front_default
      );
    }
    return (
      pokemon.sprites.other['official-artwork'].front_default ||
      pokemon.sprites.front_default
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 dark:from-blue-600 dark:via-purple-600 dark:to-indigo-700 py-8 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            >
              <div className="w-2 h-2 bg-white/20 rounded-full animate-ping" />
            </div>
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Navigation Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <Link
              href="/pokedex"
              className="inline-flex items-center text-white hover:text-white/80 transition-colors mb-4 sm:mb-0 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl font-semibold"
            >
              <ArrowLeftCircle className="mr-2" />
              Back to Pokédex
            </Link>

            {/* Status Bar */}
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg">
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-green-300" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-300" />
                )}
                <span className="text-sm text-white">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              {isCached && (
                <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg">
                  <Database className="w-4 h-4 text-blue-300" />
                  <span className="text-sm text-white">Cached</span>
                </div>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowMetrics(!showMetrics)}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
              >
                <Activity className="w-4 h-4" />
              </Button>
            </div>

            {/* Navigation Buttons */}
            <div className="flex space-x-2 sm:space-x-4">
              {prevPokemon && (
                <Link href={`/pokemon/${prevPokemon.url.split('/')[6]}`}>
                  <Button
                    variant="secondary"
                    className="flex items-center text-sm sm:text-base bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                  >
                    <ArrowLeft className="mr-1 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                    {prevPokemon.name}
                  </Button>
                </Link>
              )}
              {nextPokemon && (
                <Link href={`/pokemon/${nextPokemon.url.split('/')[6]}`}>
                  <Button
                    variant="secondary"
                    className="flex items-center text-sm sm:text-base bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                  >
                    {nextPokemon.name}
                    <ArrowRight className="ml-1 sm:ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Pokemon Header Info */}
          <div className="text-center text-white">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold capitalize mb-2 font-pixel drop-shadow-lg">
              {pokemon.name}
            </h1>
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-xl sm:text-2xl font-semibold bg-white/20 backdrop-blur-sm px-4 py-1 rounded-xl">
                #{pokemon.id.toString().padStart(3, '0')}
              </span>
              <div className="flex gap-2">
                {pokemon.types.map((type) => (
                  <Badge
                    key={type.type.name}
                    className={`${typeColors[type.type.name as keyof typeof typeColors]} text-white font-semibold px-3 py-1`}
                  >
                    {type.type.name}
                  </Badge>
                ))}
              </div>
            </div>
            {(species.is_legendary || species.is_mythical) && (
              <div className="flex items-center justify-center gap-2 mb-4">
                <Crown className="w-6 h-6 text-yellow-300" />
                <span className="text-lg font-semibold text-yellow-300">
                  {species.is_legendary
                    ? 'Legendary Pokémon'
                    : 'Mythical Pokémon'}
                </span>
                <Crown className="w-6 h-6 text-yellow-300" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-4 relative z-20 pb-8">
        {/* Enhanced Metrics Panel */}
        {showMetrics && (
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-700 shadow-xl">
            <CardContent className="p-6">
              <h3 className="font-bold mb-4 flex items-center text-lg text-blue-700 dark:text-blue-300">
                <Activity className="w-6 h-6 mr-2" />
                Performance Metrics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white/60 dark:bg-white/10 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Requests
                  </p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {metrics.requestCount}
                  </p>
                </div>
                <div className="bg-white/60 dark:bg-white/10 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Cache Hits
                  </p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {metrics.cacheHits}
                  </p>
                </div>
                <div className="bg-white/60 dark:bg-white/10 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Cache Misses
                  </p>
                  <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {metrics.cacheMisses}
                  </p>
                </div>
                <div className="bg-white/60 dark:bg-white/10 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Avg Response
                  </p>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {Math.round(metrics.averageResponseTime)}ms
                  </p>
                </div>
                <div className="bg-white/60 dark:bg-white/10 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Error Rate
                  </p>
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">
                    {metrics.errorRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Main Content Card */}
        <Card className="overflow-hidden shadow-2xl border-4 border-yellow-300/80 bg-gradient-to-br from-white via-amber-50 to-yellow-100 dark:from-gray-800 dark:via-gray-900 dark:to-blue-900">
          <CardContent className="p-0">
            <div className="flex flex-col lg:flex-row">
              {/* Left side - Pokemon Image and Stats */}
              <div className="w-full lg:w-2/5 bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-indigo-900/30 flex flex-col items-center p-6 sm:p-8 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {Array.from({ length: 6 }, (_, i) => (
                    <div
                      key={i}
                      className="absolute animate-pulse"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 3}s`,
                      }}
                    >
                      <div className="w-1 h-1 bg-white/30 rounded-full" />
                    </div>
                  ))}
                </div>

                {/* Pokemon Image */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/50 to-blue-200/50 rounded-full blur-3xl scale-110"></div>
                  <Image
                    src={getImageUrl()}
                    alt={`${pokemon.name}${isShiny ? ' (Shiny)' : ''}`}
                    width={280}
                    height={280}
                    className="object-contain relative z-10 drop-shadow-2xl"
                  />

                  {/* Refetch indicator */}
                  {isRefetching && (
                    <div className="absolute top-2 right-2 w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin bg-white/80 backdrop-blur-sm"></div>
                  )}

                  {/* Shiny indicator */}
                  {isShiny && (
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                      ✨ SHINY
                    </div>
                  )}
                </div>

                {/* Enhanced Stats Section */}
                <div className="w-full bg-white/60 dark:bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/50">
                  <h3 className="text-xl font-bold mb-4 text-center text-gray-800 dark:text-gray-200 font-pixel">
                    Base Stats
                  </h3>
                  <div className="space-y-3">
                    {pokemon.stats.map((stat, index) => {
                      const statName = stat.stat.name.replace('-', ' ');
                      const percentage = (stat.base_stat / 255) * 100;
                      const getStatColor = (value: number) => {
                        if (value >= 120) return 'from-green-500 to-green-600';
                        if (value >= 80) return 'from-yellow-500 to-yellow-600';
                        if (value >= 50) return 'from-orange-500 to-orange-600';
                        return 'from-red-500 to-red-600';
                      };

                      return (
                        <div key={stat.stat.name} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="capitalize text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {statName}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-800 dark:text-gray-200 bg-white/80 dark:bg-black/20 px-2 py-1 rounded">
                                {stat.base_stat}
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 shadow-inner">
                            <div
                              className={`bg-gradient-to-r ${getStatColor(stat.base_stat)} h-3 rounded-full shadow-sm transition-all duration-700 ease-out`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Total Stats */}
                  <div className="mt-4 pt-3 border-t border-gray-300 dark:border-gray-600">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-800 dark:text-gray-200">
                        Total:
                      </span>
                      <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                        {pokemon.stats.reduce(
                          (sum, stat) => sum + stat.base_stat,
                          0
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Enhanced Pokemon Details */}
              <div className="w-full lg:w-3/5 p-6 sm:p-8 relative">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-200/30 to-blue-200/30 rounded-full blur-3xl"></div>

                {/* Shiny Toggle - Moved to top for better visibility */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3 bg-white/60 dark:bg-white/10 rounded-xl px-4 py-2 backdrop-blur-sm border border-white/50">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      Shiny Mode
                    </span>
                    <ToggleSwitch
                      isOn={isShiny}
                      onToggle={() => setIsShiny(!isShiny)}
                    />
                  </div>

                  {/* Quick info badges */}
                  <div className="flex gap-2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      Gen {Math.ceil(pokemon.id / 151) || 1}
                    </div>
                  </div>
                </div>

                {/* Enhanced Description Section */}
                <div className="mb-6 bg-white/60 dark:bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/50">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <h3 className="text-xl font-bold mb-2 sm:mb-0 text-gray-800 dark:text-gray-200 font-pixel">
                      Pokédex Entry
                    </h3>
                    <Select value={selectedGen} onValueChange={setSelectedGen}>
                      <SelectTrigger className="w-full sm:w-[180px] bg-white/80 dark:bg-black/20 border-2 border-gray-300 dark:border-gray-600">
                        <SelectValue placeholder="Select generation" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableGens.includes('red') && (
                          <SelectItem value="red">Red Version</SelectItem>
                        )}
                        <SelectItem value="latest">Latest</SelectItem>
                        {availableGens
                          .filter((gen) => gen !== 'red')
                          .map((gen) => (
                            <SelectItem key={gen} value={gen}>
                              {gen.charAt(0).toUpperCase() + gen.slice(1)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl p-4 border-l-4 border-blue-500">
                    <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 italic">
                      "{getDescription()}"
                    </p>
                  </div>
                </div>

                {/* Enhanced Key Attributes Section */}
                <div className="bg-white/60 dark:bg-white/10 rounded-2xl p-6 mb-6 backdrop-blur-sm border border-white/50">
                  <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200 font-pixel">
                    Key Attributes
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center">
                        <div className="bg-blue-500 p-2 rounded-full mr-3">
                          <Ruler className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wide">
                            Height
                          </p>
                          <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                            {pokemon.height / 10} m
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-4 border border-green-200 dark:border-green-700">
                      <div className="flex items-center">
                        <div className="bg-green-500 p-2 rounded-full mr-3">
                          <Weight className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-green-600 dark:text-green-400 font-semibold uppercase tracking-wide">
                            Weight
                          </p>
                          <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                            {pokemon.weight / 10} kg
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-xl p-4 border border-yellow-200 dark:border-yellow-700">
                      <div className="flex items-center">
                        <div className="bg-yellow-500 p-2 rounded-full mr-3">
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold uppercase tracking-wide">
                            Main Ability
                          </p>
                          <Tooltip.Provider>
                            <Tooltip.Root>
                              <Tooltip.Trigger asChild>
                                <p className="text-lg font-bold capitalize cursor-help text-gray-800 dark:text-gray-200 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors">
                                  {mainAbility?.name || 'Unknown'}
                                </p>
                              </Tooltip.Trigger>
                              <Tooltip.Portal>
                                <Tooltip.Content
                                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-3 rounded-lg shadow-lg max-w-xs text-sm border border-gray-200 dark:border-gray-700"
                                  sideOffset={5}
                                >
                                  {getAbilityDescription()}
                                  <Tooltip.Arrow className="fill-current text-white dark:text-gray-800" />
                                </Tooltip.Content>
                              </Tooltip.Portal>
                            </Tooltip.Root>
                          </Tooltip.Provider>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                      <div className="flex items-center">
                        <div className="bg-purple-500 p-2 rounded-full mr-3">
                          <Star className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold uppercase tracking-wide">
                            Base Experience
                          </p>
                          <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                            {pokemon.base_experience}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Type Effectiveness Section */}
                <div className="bg-white/60 dark:bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/50">
                  <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-200 font-pixel">
                    Type Effectiveness
                  </h3>

                  <div className="space-y-6">
                    {/* Pokemon Types */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl p-4 border border-indigo-200 dark:border-indigo-700">
                      <h4 className="font-bold mb-3 text-indigo-700 dark:text-indigo-300 flex items-center">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                        Types
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {pokemon.types.map((type) => (
                          <Badge
                            key={type.type.name}
                            className={`${typeColors[type.type.name as keyof typeof typeColors]} text-white font-bold px-3 py-1 text-sm shadow-lg hover:scale-105 transition-transform`}
                          >
                            {type.type.name.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Weaknesses */}
                    {weaknesses.length > 0 && (
                      <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 rounded-xl p-4 border border-red-200 dark:border-red-700">
                        <h4 className="font-bold mb-3 text-red-700 dark:text-red-300 flex items-center">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                          Weak To (Takes 2× damage)
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {weaknesses.map((type) => (
                            <Badge
                              key={type}
                              className={`${typeColors[type as keyof typeof typeColors]} text-white font-bold px-3 py-1 text-sm shadow-lg hover:scale-105 transition-transform`}
                            >
                              {type.toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Strengths */}
                    {strengths.length > 0 && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl p-4 border border-green-200 dark:border-green-700">
                        <h4 className="font-bold mb-3 text-green-700 dark:text-green-300 flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          Strong Against (Deals 2× damage)
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {strengths.map((type) => (
                            <Badge
                              key={type}
                              className={`${typeColors[type as keyof typeof typeColors]} text-white font-bold px-3 py-1 text-sm shadow-lg hover:scale-105 transition-transform`}
                            >
                              {type.toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Additional Details Section */}
        <Card className="mt-6 overflow-hidden shadow-2xl border-4 border-green-300/80 bg-gradient-to-br from-white via-green-50 to-emerald-100 dark:from-gray-800 dark:via-gray-900 dark:to-green-900">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200 font-pixel">
              Additional Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {species.egg_groups && species.egg_groups.length > 0 && (
                <div className="bg-white/60 dark:bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/50 hover:scale-105 transition-transform">
                  <div className="flex items-center">
                    <div className="bg-blue-500 p-2 rounded-full mr-3">
                      <Egg className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wide">
                        Egg Groups
                      </p>
                      <p className="font-bold capitalize text-gray-800 dark:text-gray-200">
                        {species.egg_groups
                          .map((group: any) => group.name)
                          .join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {species.capture_rate !== undefined && (
                <div className="bg-white/60 dark:bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/50 hover:scale-105 transition-transform">
                  <div className="flex items-center">
                    <div className="bg-green-500 p-2 rounded-full mr-3">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-green-600 dark:text-green-400 font-semibold uppercase tracking-wide">
                        Catch Rate
                      </p>
                      <p className="font-bold text-gray-800 dark:text-gray-200">
                        {species.capture_rate}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {species.base_happiness !== undefined && (
                <div className="bg-white/60 dark:bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/50 hover:scale-105 transition-transform">
                  <div className="flex items-center">
                    <div className="bg-red-500 p-2 rounded-full mr-3">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-red-600 dark:text-red-400 font-semibold uppercase tracking-wide">
                        Base Friendship
                      </p>
                      <p className="font-bold text-gray-800 dark:text-gray-200">
                        {species.base_happiness}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {species.growth_rate && (
                <div className="bg-white/60 dark:bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/50 hover:scale-105 transition-transform">
                  <div className="flex items-center">
                    <div className="bg-purple-500 p-2 rounded-full mr-3">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold uppercase tracking-wide">
                        Growth Rate
                      </p>
                      <p className="font-bold capitalize text-gray-800 dark:text-gray-200">
                        {species.growth_rate?.name}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white/60 dark:bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/50 hover:scale-105 transition-transform">
                <div className="flex items-center">
                  <div className="bg-yellow-500 p-2 rounded-full mr-3">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold uppercase tracking-wide">
                      Habitat
                    </p>
                    <p className="font-bold capitalize text-gray-800 dark:text-gray-200">
                      {species.habitat?.name || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 dark:bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/50 hover:scale-105 transition-transform">
                <div className="flex items-center">
                  <div className="bg-indigo-500 p-2 rounded-full mr-3">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wide">
                      Gender Ratio
                    </p>
                    <p className="font-bold text-gray-800 dark:text-gray-200">
                      {getGenderRatio(species.gender_rate)}
                    </p>
                  </div>
                </div>
              </div>

              {(species.is_legendary || species.is_mythical) && (
                <div className="bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/40 rounded-xl p-4 border-2 border-amber-300 dark:border-amber-600 hover:scale-105 transition-transform shadow-lg">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-2 rounded-full mr-3 animate-pulse">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold uppercase tracking-wide">
                        Classification
                      </p>
                      <p className="font-bold text-amber-800 dark:text-amber-300 text-lg">
                        {species.is_legendary ? 'Legendary' : 'Mythical'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Evolution Chain */}
        {evolutionChain && evolutionChain.chain && (
          <Card className="overflow-hidden shadow-2xl mt-6 border-4 border-purple-300/80 bg-gradient-to-br from-white via-purple-50 to-indigo-100 dark:from-gray-800 dark:via-gray-900 dark:to-purple-900">
            <CardContent className="p-6 sm:p-8 relative">
              {/* Background decoration */}
              <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-purple-200/30 to-indigo-200/30 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-200/30 to-blue-200/30 rounded-full blur-3xl"></div>

              <div className="relative z-10">
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center font-pixel text-gray-800 dark:text-gray-200">
                  ⚡ Evolution Chain ⚡
                </h2>
                <div className="bg-white/60 dark:bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/50">
                  <EvolutionChainComponent chain={evolutionChain} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PokemonDetailPage;
