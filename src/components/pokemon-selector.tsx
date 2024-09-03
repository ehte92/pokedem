import React, { useState } from 'react';

import { useQuery } from 'react-query';

import { fetchPokemonDetails, fetchPokemonList } from '@/lib/api';
import { PokemonDetails, PokemonListItem } from '@/lib/types';

import LazyImage from './lazy-image';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';

interface PokemonSelectorProps {
  onSelect: (pokemon: PokemonDetails) => void;
}

const PokemonSelector: React.FC<PokemonSelectorProps> = ({ onSelect }) => {
  const [search, setSearch] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState<string | null>(null);

  const { data: pokemonList } = useQuery('pokemonList', () =>
    fetchPokemonList(0, 1000)
  );

  const { data: pokemonDetails, isLoading } = useQuery(
    ['pokemonDetails', selectedPokemon],
    () => fetchPokemonDetails(selectedPokemon!),
    { enabled: !!selectedPokemon }
  );

  const filteredPokemon =
    pokemonList?.results.filter((pokemon: PokemonListItem) =>
      pokemon.name.toLowerCase().includes(search.toLowerCase())
    ) || [];

  const handleSelect = () => {
    if (pokemonDetails) {
      onSelect(pokemonDetails);
      setSelectedPokemon(null);
      setSearch('');
    }
  };

  const getPokemonId = (url: string) => {
    const parts = url.split('/');
    return parts[parts.length - 2];
  };

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Search Pokémon..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full"
      />
      <ScrollArea className="h-60 sm:h-80 rounded-md border p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
          {filteredPokemon.map((pokemon: PokemonListItem) => {
            const pokemonId = getPokemonId(pokemon.url);
            return (
              <Card
                key={pokemon.name}
                className={`cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                  selectedPokemon === pokemon.name
                    ? 'ring-2 ring-blue-500 dark:ring-blue-400'
                    : ''
                }`}
                onClick={() => setSelectedPokemon(pokemon.name)}
              >
                <CardContent className="p-2 sm:p-4 flex flex-col items-center">
                  <LazyImage
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`}
                    alt={pokemon.name}
                    width={64}
                    height={64}
                    className="pixelated"
                  />
                  <p className="mt-1 sm:mt-2 text-xs sm:text-sm font-semibold capitalize truncate w-full text-center">
                    {pokemon.name}
                  </p>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    #{pokemonId.padStart(3, '0')}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {selectedPokemon && (
        <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 sm:p-4 rounded-lg">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <LazyImage
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${getPokemonId(
                pokemonList?.results.find(
                  (p: PokemonListItem) => p.name === selectedPokemon
                )?.url || ''
              )}.png`}
              alt={selectedPokemon}
              width={48}
              height={48}
              className="pixelated"
            />
            <span className="text-sm sm:text-lg font-semibold capitalize">
              {selectedPokemon}
            </span>
          </div>
          <Button onClick={handleSelect} disabled={isLoading} size="sm">
            {isLoading ? 'Loading...' : 'Add to Team'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PokemonSelector;
