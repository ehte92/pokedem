'use client';

import React from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from 'react-query';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';

import { Card, CardContent } from '@/components/ui/card';
import { fetchPokemonDetails } from '@/lib/api';
import { typeColors } from '@/lib/constants';
import { PokemonDetails } from '@/lib/types';

// Assuming there are 898 Pokémon in total (up to Generation 8)
const TOTAL_POKEMON = 898;
const FEATURED_POKEMON_COUNT = 10;

// Function to generate a list of random Pokémon IDs that changes daily
const getRandomPokemonIds = () => {
  const today = new Date().toDateString();
  let seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const randomIds = new Set<number>();
  const pseudoRandom = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  while (randomIds.size < FEATURED_POKEMON_COUNT) {
    const id = Math.floor(pseudoRandom() * TOTAL_POKEMON) + 1;
    randomIds.add(id);
  }

  return Array.from(randomIds);
};

interface FeaturedPokemonProps {
  pokemonId: number;
}

const FeaturedPokemon: React.FC<FeaturedPokemonProps> = ({ pokemonId }) => {
  const {
    data: details,
    isLoading,
    error,
  } = useQuery<PokemonDetails, Error>(['pokemonDetails', pokemonId], () =>
    fetchPokemonDetails(pokemonId.toString())
  );

  if (isLoading)
    return (
      <Card className="h-80 animate-pulse bg-gray-300 dark:bg-gray-700"></Card>
    );
  if (error)
    return (
      <Card className="h-80 flex items-center justify-center text-red-500">
        Error loading Pokémon
      </Card>
    );
  if (!details) return null;

  const imageUrl =
    details.sprites.other?.['official-artwork']?.front_default ||
    details.sprites.front_default;

  return (
    <Link href={`/pokemon/${details.id}`} passHref>
      <Card className="transition-all duration-300 transform spotlight-card overflow-hidden border-4 border-yellow-400 bg-red-500 dark:bg-red-700">
        <CardContent className="p-0">
          <div className="bg-white dark:bg-gray-800 rounded-t-lg p-4">
            <div className="relative h-48 flex items-center justify-center mb-4">
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt={details.name}
                  width={150}
                  height={150}
                  className="object-contain transition-all duration-300 drop-shadow-lg"
                />
              )}
              <div className="absolute top-0 left-0 bg-blue-500 dark:bg-blue-600 text-white px-2 py-1 rounded-br-lg text-xs font-bold">
                #{details.id.toString().padStart(3, '0')}
              </div>
            </div>
            <h3 className="text-xl font-bold text-center capitalize mb-2 text-gray-800 dark:text-white">
              {details.name}
            </h3>
            <div className="flex justify-center gap-2 mb-2">
              {details.types.map((type) => (
                <span
                  key={type.type.name}
                  className={`px-2 py-1 rounded text-xs text-white font-semibold ${typeColors[type.type.name]}`}
                >
                  {type.type.name}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-red-500 dark:bg-red-700 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Ability:</span>{' '}
                {details.abilities[0]?.ability.name}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                <span className="font-semibold">Height:</span>{' '}
                {details.height / 10} m
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                <span className="font-semibold">Weight:</span>{' '}
                {details.weight / 10} kg
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

const Home: React.FC = () => {
  const randomPokemonIds = React.useMemo(() => getRandomPokemonIds(), []);

  const settings = {
    className: 'center spotlight-carousel',
    centerMode: true,
    infinite: true,
    centerPadding: '60px',
    slidesToShow: 3,
    speed: 500,
    focusOnSelect: true,
    dots: true,
    arrows: true,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
          centerPadding: '40px',
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          centerPadding: '120px',
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerPadding: '60px',
        },
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">
        Welcome to the Pokémon App
      </h1>
      <p className="text-lg text-center mb-8 text-gray-600 dark:text-gray-400">
        Explore the world of Pokémon, build your Pokédex, and become a Pokémon
        Master!
      </p>

      <div className="mb-16">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800 dark:text-gray-200">
          Featured Pokémon
        </h2>
        <div className="spotlight-carousel-container px-4 md:px-12">
          {' '}
          {/* Added horizontal padding */}
          <Slider {...settings}>
            {randomPokemonIds.map((id) => (
              <div key={id} className="px-2">
                <FeaturedPokemon pokemonId={id} />
              </div>
            ))}
          </Slider>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Pokédex</h2>
            <p className="mb-4">
              Access comprehensive information about all Pokémon species,
              including their types, abilities, and stats.
            </p>
            <Link
              href="/pokedex"
              className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Open Pokédex
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Team Builder</h2>
            <p className="mb-4">
              Create your dream Pokémon team and analyze its strengths and
              weaknesses.
            </p>
            <Link
              href="/team-builder"
              className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
            >
              Build Your Team
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
