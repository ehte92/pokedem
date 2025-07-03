import React from 'react';

import { motion } from 'framer-motion';
import { Heart, Star } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from 'react-query';

import { fetchPokemonDetails } from '@/lib/api';
import { PokemonDetails, PokemonListItem } from '@/lib/types';

import LazyImage from './lazy-image';

interface PokemonListCardProps {
  pokemon: PokemonListItem;
}

const typeColors = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
};

// Compact TCG-style card backgrounds
const typeCardBackgrounds = {
  normal: 'linear-gradient(135deg, #F5F5DC 0%, #E6E6FA 100%)',
  fire: 'linear-gradient(135deg, #FFE4E1 0%, #FFA07A 100%)',
  water: 'linear-gradient(135deg, #E0F6FF 0%, #87CEEB 100%)',
  electric: 'linear-gradient(135deg, #FFFACD 0%, #F0E68C 100%)',
  grass: 'linear-gradient(135deg, #F0FFF0 0%, #98FB98 100%)',
  ice: 'linear-gradient(135deg, #F0FFFF 0%, #B0E0E6 100%)',
  fighting: 'linear-gradient(135deg, #FFE4E1 0%, #CD5C5C 100%)',
  poison: 'linear-gradient(135deg, #E6E6FA 0%, #DDA0DD 100%)',
  ground: 'linear-gradient(135deg, #FFF8DC 0%, #D2B48C 100%)',
  flying: 'linear-gradient(135deg, #F0F8FF 0%, #87CEFA 100%)',
  psychic: 'linear-gradient(135deg, #FFE4E1 0%, #DDA0DD 100%)',
  bug: 'linear-gradient(135deg, #F0FFF0 0%, #ADFF2F 100%)',
  rock: 'linear-gradient(135deg, #FFF8DC 0%, #A0522D 100%)',
  ghost: 'linear-gradient(135deg, #E6E6FA 0%, #9370DB 100%)',
  dragon: 'linear-gradient(135deg, #F0F8FF 0%, #6A5ACD 100%)',
  dark: 'linear-gradient(135deg, #2F2F2F 0%, #4A4A4A 100%)',
  steel: 'linear-gradient(135deg, #F8F8FF 0%, #C0C0C0 100%)',
  fairy: 'linear-gradient(135deg, #FFF0F5 0%, #FFB6C1 100%)',
};

// Compact Type Badge Component
const TypeBadge: React.FC<{ type: string; size?: 'sm' | 'md' }> = ({
  type,
  size = 'sm',
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5 text-xs',
    md: 'w-6 h-6 text-sm',
  };

  const typeSymbols = {
    normal: '●',
    fire: '🔥',
    water: '💧',
    electric: '⚡',
    grass: '🌿',
    ice: '❄️',
    fighting: '👊',
    poison: '☠️',
    ground: '🌍',
    flying: '🌪️',
    psychic: '🔮',
    bug: '🐛',
    rock: '🗿',
    ghost: '👻',
    dragon: '🐲',
    dark: '🌙',
    steel: '⚙️',
    fairy: '✨',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-bold shadow-md border border-white/30`}
      style={{
        backgroundColor: typeColors[type as keyof typeof typeColors],
      }}
      title={type.charAt(0).toUpperCase() + type.slice(1)}
    >
      <span className="text-xs">
        {typeSymbols[type as keyof typeof typeSymbols]}
      </span>
    </div>
  );
};

const PokemonListCard: React.FC<PokemonListCardProps> = ({ pokemon }) => {
  const pokemonId = pokemon.url.split('/')[6];
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
  const backupImageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;

  const { data: pokemonDetails, isLoading } = useQuery<PokemonDetails>(
    ['pokemonDetails', pokemonId],
    () => fetchPokemonDetails(pokemonId),
    {
      staleTime: Infinity,
      retry: 3,
    }
  );

  const mainType = pokemonDetails?.types[0]?.type.name || 'normal';
  const isRare =
    pokemonDetails &&
    ((parseInt(pokemonId) >= 144 && parseInt(pokemonId) <= 151) ||
      (parseInt(pokemonId) >= 243 && parseInt(pokemonId) <= 251) ||
      (parseInt(pokemonId) >= 377 && parseInt(pokemonId) <= 386) ||
      pokemonDetails.stats.reduce((sum, stat) => sum + stat.base_stat, 0) >
        600);

  const hpStat = pokemonDetails?.stats.find(
    (s) => s.stat.name === 'hp'
  )?.base_stat;

  return (
    <Link href={`/pokemon/${pokemonId}`}>
      <motion.div
        className="relative w-full h-80 rounded-2xl overflow-hidden cursor-pointer group"
        style={{
          background:
            typeCardBackgrounds[mainType as keyof typeof typeCardBackgrounds] ||
            typeCardBackgrounds.normal,
          boxShadow: isRare
            ? '0 8px 25px rgba(255, 215, 0, 0.3), 0 0 0 2px rgba(255, 215, 0, 0.4)'
            : '0 4px 15px rgba(0, 0, 0, 0.1)',
        }}
        whileHover={{
          scale: 1.03,
          y: -6,
          boxShadow: isRare
            ? '0 12px 35px rgba(255, 215, 0, 0.4), 0 0 0 3px rgba(255, 215, 0, 0.6)'
            : '0 8px 25px rgba(0, 0, 0, 0.15)',
        }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3,
          type: 'spring',
          stiffness: 300,
          damping: 20,
        }}
      >
        {/* TCG Card Border */}
        <div className="absolute inset-0 rounded-2xl border-4 border-yellow-300/80 shadow-inner" />
        <div className="absolute inset-1 rounded-xl border border-yellow-400/30" />

        {/* Rare Card Shimmer */}
        {isRare && (
          <motion.div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              background:
                'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.6) 50%, transparent 70%)',
            }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
              repeatDelay: 2,
            }}
          />
        )}

        {/* Card Content */}
        <div className="relative z-10 p-3 h-full flex flex-col">
          {/* Header - Name and HP */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-black capitalize truncate leading-tight">
                {pokemon.name}
              </h3>
              <p className="text-xs text-black/60">Basic Pokémon</p>
            </div>

            <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-md font-bold text-sm shadow-md ml-2">
              <Heart className="w-3 h-3" fill="currentColor" />
              <span>{hpStat || '??'}</span>
            </div>
          </div>

          {/* Type Icons */}
          <div className="flex gap-1 mb-3">
            {isLoading ? (
              <div className="w-5 h-5 bg-gray-300 rounded-full animate-pulse" />
            ) : (
              pokemonDetails?.types
                .slice(0, 2)
                .map((type) => (
                  <TypeBadge key={type.type.name} type={type.type.name} />
                ))
            )}
          </div>

          {/* Main Artwork Area */}
          <div className="relative flex-1 bg-gradient-to-b from-white/60 to-white/40 rounded-lg p-2 mb-3 shadow-inner border border-white/50 min-h-0">
            <div className="relative h-full flex items-center justify-center">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-1 left-1 w-3 h-3 border border-gray-400 rounded-full" />
                <div className="absolute top-1 right-1 w-2 h-2 border border-gray-400 rounded-full" />
                <div className="absolute bottom-1 left-2 w-2 h-2 border border-gray-400 rounded-full" />
                <div className="absolute bottom-1 right-3 w-3 h-3 border border-gray-400 rounded-full" />
              </div>

              <LazyImage
                src={imageUrl}
                lowResSrc={backupImageUrl}
                alt={pokemon.name}
                width={120}
                height={120}
                className="drop-shadow-lg max-w-full max-h-full object-contain"
              />
            </div>
          </div>

          {/* Attack Section */}
          <div className="bg-white/80 rounded-lg p-2 mb-2 shadow-sm border border-gray-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <TypeBadge type={mainType} size="sm" />
                <span className="font-semibold text-sm text-black">
                  Quick Attack
                </span>
              </div>
              <div className="bg-red-500 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                {pokemonDetails?.stats.find((s) => s.stat.name === 'attack')
                  ?.base_stat || '??'}
              </div>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="flex justify-between items-center text-xs">
            <div className="flex gap-2">
              <span className="text-black/60">
                #{pokemonId.padStart(3, '0')}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {isRare ? (
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
              ) : (
                <div className="w-3 h-3 bg-gray-400 rounded-full" />
              )}
              <span className="text-black/60 font-medium">PokéDem</span>
            </div>
          </div>
        </div>

        {/* Hover Overlay */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 rounded-2xl"
          initial={{ opacity: 0 }}
        >
          <div className="text-center text-white p-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
              <p className="font-bold mb-1">View Details</p>
              <p className="text-sm opacity-90">
                Explore {pokemon.name}'s full profile
              </p>
            </div>
          </div>
        </motion.div>

        {/* Subtle card shine */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-30"
          style={{
            background:
              'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)',
          }}
          animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>
    </Link>
  );
};

export default PokemonListCard;
