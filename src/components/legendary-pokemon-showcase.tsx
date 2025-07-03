'use client';

import React, { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Eye, Sparkles, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { useLegendaryPokemon } from '@/hooks/use-legendary-pokemon';
import {
  cardVariants,
  scaleIn,
  slideInFromLeft,
  slideInFromRight,
  sparkleVariants,
  staggeredFadeIn,
} from '@/lib/animation-variants';

import LoadingSpinner from './loading-spinner';
import TypeBadge from './type-badge';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const LegendaryPokemonShowcase: React.FC = () => {
  const { data: legendaryPokemon, isLoading, error } = useLegendaryPokemon();
  const [currentPage, setCurrentPage] = useState(0);
  const [hoveredPokemon, setHoveredPokemon] = useState<number | null>(null);

  const pokemonPerPage = 6;
  const totalPages = Math.ceil(
    (legendaryPokemon?.length || 0) / pokemonPerPage
  );

  const getCurrentPagePokemon = () => {
    if (!legendaryPokemon) return [];
    const startIndex = currentPage * pokemonPerPage;
    return legendaryPokemon.slice(startIndex, startIndex + pokemonPerPage);
  };

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  // Sparkle animation for background
  const sparkles = Array.from({ length: 12 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute text-yellow-300 dark:text-yellow-200 text-xs opacity-60 dark:opacity-40"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      variants={sparkleVariants}
      animate="animate"
    >
      <Sparkles size={16} />
    </motion.div>
  ));

  if (isLoading) {
    return (
      <div className="py-20 bg-gradient-to-br from-purple-200 via-blue-200 to-indigo-200 dark:from-purple-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LoadingSpinner
              size="lg"
              message="Summoning legendary Pokémon..."
            />
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 bg-gradient-to-br from-purple-200 via-blue-200 to-indigo-200 dark:from-purple-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-gray-900 dark:text-white"
          >
            <h2 className="text-2xl font-bold mb-4">
              Failed to load legendary Pokémon
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {error.message}
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  const currentPokemon = getCurrentPagePokemon();

  return (
    <div className="relative py-16 bg-gradient-to-br from-purple-200 via-blue-200 to-indigo-200 dark:from-purple-900 dark:via-blue-900 dark:to-indigo-900 overflow-hidden">
      {/* Animated background sparkles */}
      <div className="absolute inset-0 pointer-events-none">{sparkles}</div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent dark:from-black/20 dark:to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-purple-600 to-blue-600 dark:from-yellow-400 dark:via-purple-400 dark:to-blue-400 mb-4">
            Legendary Pokémon Showcase
          </h2>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100px' }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-1 bg-gradient-to-r from-yellow-600 to-purple-600 dark:from-yellow-400 dark:to-purple-400 mx-auto mb-6"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-gray-700 dark:text-gray-300 text-lg max-w-2xl mx-auto"
          >
            Discover the most powerful and mysterious Pokémon in existence
          </motion.p>
        </motion.div>

        {/* Pokemon Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <AnimatePresence mode="wait">
            {currentPokemon.map((pokemon, index) => (
              <motion.div
                key={`${pokemon.id}-${currentPage}`}
                custom={index}
                variants={staggeredFadeIn}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
                onHoverStart={() => setHoveredPokemon(pokemon.id)}
                onHoverEnd={() => setHoveredPokemon(null)}
              >
                <motion.div
                  variants={cardVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                  className="relative group cursor-pointer h-full"
                >
                  <Card className="h-full overflow-hidden bg-white/90 dark:bg-white/10 backdrop-blur-lg border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white relative shadow-xl dark:shadow-2xl">
                    {/* Glow effect on hover */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 dark:from-purple-400/10 dark:to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
                      animate={{
                        scale: hoveredPokemon === pokemon.id ? 1.02 : 1,
                      }}
                    />

                    <CardHeader className="relative h-64 overflow-hidden">
                      {/* Pokemon Image */}
                      <div className="relative w-full h-full">
                        <Image
                          src={
                            pokemon.sprites?.other?.['official-artwork']
                              ?.front_default ||
                            pokemon.sprites?.front_default ||
                            '/placeholder-pokemon.png'
                          }
                          alt={pokemon.name}
                          fill
                          className="object-contain transform group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-pokemon.png';
                          }}
                        />

                        {/* Floating stars on hover */}
                        <AnimatePresence>
                          {hoveredPokemon === pokemon.id && (
                            <>
                              {Array.from({ length: 6 }, (_, i) => (
                                <motion.div
                                  key={i}
                                  className="absolute text-yellow-500 dark:text-yellow-300"
                                  style={{
                                    left: `${20 + Math.random() * 60}%`,
                                    top: `${20 + Math.random() * 60}%`,
                                  }}
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{
                                    opacity: 1,
                                    scale: 1,
                                    y: [-10, 10, -10],
                                    rotate: [0, 360],
                                  }}
                                  exit={{ opacity: 0, scale: 0 }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                  }}
                                >
                                  <Star size={12} />
                                </motion.div>
                              ))}
                            </>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Rarity indicator */}
                      <motion.div
                        className="absolute top-4 right-4 bg-yellow-500/90 dark:bg-yellow-500/80 rounded-full p-2"
                        animate={{
                          rotate: hoveredPokemon === pokemon.id ? 360 : 0,
                          scale: hoveredPokemon === pokemon.id ? 1.1 : 1,
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        <Sparkles size={16} className="text-white" />
                      </motion.div>
                    </CardHeader>

                    <CardContent className="p-6 relative z-10">
                      <CardTitle className="text-2xl mb-3 capitalize font-bold text-gray-900 dark:text-white">
                        {pokemon.name}
                      </CardTitle>

                      {/* Types */}
                      <div className="mb-4 flex flex-wrap gap-2">
                        {pokemon.types.map((type) => (
                          <TypeBadge
                            key={type.type.name}
                            type={type.type.name}
                          />
                        ))}
                      </div>

                      {/* Stats preview */}
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          Base Stats Total:
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                            <motion.div
                              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-400 dark:to-blue-400 rounded-full"
                              initial={{ width: 0 }}
                              animate={{
                                width: `${Math.min((pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0) / 700) * 100, 100)}%`,
                              }}
                              transition={{ duration: 1, delay: 0.5 }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {pokemon.stats.reduce(
                              (sum, stat) => sum + stat.base_stat,
                              0
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Abilities */}
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          Abilities:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {pokemon.abilities.slice(0, 2).map((ability) => (
                            <Badge
                              key={ability.ability.name}
                              variant="secondary"
                              className="text-xs bg-gray-200 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 capitalize border border-gray-300 dark:border-gray-600"
                            >
                              {ability.ability.name.replace('-', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* View Details Button */}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="mt-4"
                      >
                        <Link href={`/pokemon/${pokemon.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full bg-white/10 dark:bg-white/10 border-gray-400 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/20 transition-colors shadow-md"
                          >
                            <Eye size={16} className="mr-2" />
                            View Details
                          </Button>
                        </Link>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <motion.div
            className="flex justify-center items-center gap-4 mb-8"
            variants={scaleIn}
            initial="hidden"
            animate="visible"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={prevPage}
              className="bg-white/20 dark:bg-white/10 border-gray-400 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/20"
              disabled={currentPage === 0}
            >
              <ChevronLeft size={16} className="mr-1" />
              Previous
            </Button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    i === currentPage
                      ? 'bg-purple-600 dark:bg-purple-400'
                      : 'bg-gray-400 dark:bg-white/30 hover:bg-gray-600 dark:hover:bg-white/50'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              className="bg-white/20 dark:bg-white/10 border-gray-400 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/20"
              disabled={currentPage === totalPages - 1}
            >
              Next
              <ChevronRight size={16} className="ml-1" />
            </Button>
          </motion.div>
        )}

        {/* CTA Section */}
        <motion.div
          className="text-center"
          variants={slideInFromLeft}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.8 }}
        >
          <Link href="/legendary-pokemon" passHref>
            <motion.div
              className="inline-block relative overflow-hidden rounded-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 dark:from-purple-500 dark:via-blue-500 dark:to-indigo-500" />

              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />

              <div className="relative px-8 py-4 text-white font-bold text-lg cursor-pointer backdrop-blur-sm">
                <Sparkles className="inline mr-2" size={20} />
                Explore All Legendary Pokémon
              </div>
            </motion.div>
          </Link>

          <motion.p
            className="text-gray-600 dark:text-gray-300 mt-4 text-sm"
            variants={slideInFromRight}
            initial="hidden"
            animate="visible"
            transition={{ delay: 1 }}
          >
            Showing {currentPokemon.length} of {legendaryPokemon?.length || 0}{' '}
            legendary Pokémon
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default LegendaryPokemonShowcase;
