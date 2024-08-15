import React, { useEffect, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useQuery } from 'react-query';

import { fetchPokemonDetails, fetchPokemonList } from '@/lib/api';
import { typeColors } from '@/lib/constants';
import { PokemonDetails, PokemonListItem } from '@/lib/types';

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';

interface TeamSelectionProps {
  onTeamSelected: (team: PokemonDetails[]) => void;
}

const TeamSelection: React.FC<TeamSelectionProps> = ({ onTeamSelected }) => {
  const { theme } = useTheme();
  const [selectedTeam, setSelectedTeam] = useState<PokemonDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: pokemonList } = useQuery('pokemonList', () =>
    fetchPokemonList(0, 151)
  );

  const filteredPokemon =
    pokemonList?.results.filter((pokemon: PokemonListItem) =>
      pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handlePokemonSelect = async (pokemonName: string) => {
    if (selectedTeam.length < 3) {
      const pokemonDetails = await fetchPokemonDetails(pokemonName);
      setSelectedTeam([...selectedTeam, pokemonDetails]);
    }
  };

  const handlePokemonRemove = (index: number) => {
    setSelectedTeam(selectedTeam.filter((_, i) => i !== index));
  };

  const handleTeamConfirm = () => {
    if (selectedTeam.length === 3) {
      onTeamSelected(selectedTeam);
    }
  };

  const getPokemonId = (url: string) => {
    const parts = url.split('/');
    return parts[parts.length - 2];
  };

  return (
    <div
      className={`p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
    >
      <h2 className="text-3xl font-bold mb-6 text-center">Select Your Team</h2>
      <Input
        type="text"
        placeholder="Search Pokémon..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-6"
      />
      <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
        <Card className="w-full md:w-2/3">
          <CardContent className="p-4">
            <ScrollArea className="h-96 w-full">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredPokemon.map((pokemon: PokemonListItem) => {
                  const pokemonId = getPokemonId(pokemon.url);
                  return (
                    <motion.div
                      key={pokemon.name}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all duration-200 ${
                          theme === 'dark'
                            ? 'hover:bg-gray-700'
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={() => handlePokemonSelect(pokemon.name)}
                      >
                        <CardContent className="p-2 text-center">
                          <Image
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`}
                            alt={pokemon.name}
                            width={96}
                            height={96}
                            className="mx-auto pixelated"
                          />
                          <p className="mt-2 text-sm font-semibold capitalize">
                            {pokemon.name}
                          </p>
                          <Badge variant="secondary" className="mt-1">
                            #{pokemonId.padStart(3, '0')}
                          </Badge>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="w-full md:w-1/3">
          <CardContent className="p-4">
            <h3 className="text-xl font-semibold mb-4">Your Team</h3>
            <AnimatePresence>
              {selectedTeam.map((pokemon, index) => (
                <motion.div
                  key={pokemon.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-center justify-between mb-4 p-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <Image
                      src={pokemon.sprites.front_default}
                      alt={pokemon.name}
                      width={48}
                      height={48}
                      className="pixelated"
                    />
                    <div className="ml-2">
                      <p className="font-semibold capitalize">{pokemon.name}</p>
                      <div className="flex space-x-1 mt-1">
                        {pokemon.types.map((type) => (
                          <Badge
                            key={type.type.name}
                            className={`${typeColors[type.type.name]} text-white text-xs`}
                          >
                            {type.type.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handlePokemonRemove(index)}
                  >
                    Remove
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
            <Button
              onClick={handleTeamConfirm}
              disabled={selectedTeam.length !== 3}
              className="mt-4 w-full"
            >
              {selectedTeam.length === 3
                ? 'Confirm Team'
                : `Select ${3 - selectedTeam.length} more`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamSelection;
