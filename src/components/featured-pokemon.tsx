import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';
import { usePokemonDetails } from '@/hooks/use-pokemon-details';
import { typeColors } from '@/lib/constants';

interface FeaturedPokemonProps {
  pokemonId: number;
}

const FeaturedPokemon: React.FC<FeaturedPokemonProps> = ({ pokemonId }) => {
  const { data: details, isLoading, error } = usePokemonDetails(pokemonId);

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

export default FeaturedPokemon;
