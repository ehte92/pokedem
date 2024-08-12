'use client';

import React from 'react';

import Link from 'next/link';
import { useQuery } from 'react-query';
import Slider from 'react-slick';

import { fetchPokemonDetails, fetchPokemonList } from '@/lib/api';
import { typeColors } from '@/lib/constants';
import {
  PokemonDetails,
  PokemonListItem,
  PokemonListResponse,
} from '@/lib/types';

interface FeaturedPokemonProps {
  pokemon: PokemonListItem;
}

const FeaturedPokemon: React.FC<FeaturedPokemonProps> = ({ pokemon }) => {
  const {
    data: details,
    isLoading,
    error,
  } = useQuery<PokemonDetails, Error>(['pokemonDetails', pokemon.name], () =>
    fetchPokemonDetails(pokemon.name)
  );

  if (isLoading)
    return (
      <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-72 rounded-lg"></div>
    );
  if (error) return <div className="text-red-500">Error loading Pokémon</div>;
  if (!details) return null;

  const imageUrl =
    details.sprites.other?.['official-artwork']?.front_default ||
    details.sprites.front_default;

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden mx-2">
      <div className="h-48 bg-gray-700 flex items-center justify-center">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={pokemon.name}
            className="w-full h-full object-contain"
          />
        )}
      </div>
      <div className="p-3 text-white">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-base font-semibold capitalize truncate">
            {pokemon.name}
          </h3>
          <span className="text-sm text-gray-400">
            #{details.id.toString().padStart(3, '0')}
          </span>
        </div>
        <div className="flex flex-wrap gap-1 mb-1">
          {details.types.map((type) => (
            <span
              key={type.type.name}
              className={`${typeColors[type.type.name]} px-2 py-0.5 rounded text-xs`}
            >
              {type.type.name}
            </span>
          ))}
        </div>
        <div className="text-xs truncate">
          Ability: {details.abilities[0]?.ability.name}
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const {
    data: featuredPokemon,
    isLoading,
    error,
  } = useQuery<PokemonListResponse, Error>('featuredPokemon', () =>
    fetchPokemonList(0, 10)
  );

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
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

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800 dark:text-gray-200">
          Featured Pokémon
        </h2>
        {isLoading ? (
          <div className="flex space-x-4">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="animate-pulse bg-gray-300 dark:bg-gray-700 h-72 w-full rounded-lg"
              ></div>
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-500">
            Error loading featured Pokémon
          </p>
        ) : (
          <Slider {...settings}>
            {featuredPokemon?.results.map((pokemon) => (
              <FeaturedPokemon key={pokemon.name} pokemon={pokemon} />
            ))}
          </Slider>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Pokédex
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Access comprehensive information about all Pokémon species,
            including their types, abilities, and stats.
          </p>
          <Link
            href="/pokedex"
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Open Pokédex
          </Link>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Search
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Looking for a specific Pokémon? Use our search feature to find
            information quickly.
          </p>
          <Link
            href="/pokedex"
            className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            Search Pokémon
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
