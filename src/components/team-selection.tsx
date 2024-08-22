import React, { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
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
    <div className="p-4 rounded-lg shadow-lg dark:bg-gray-800 dark:text-white bg-white text-gray-900">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">
        Select Your Team
      </h2>
      <Input
        type="text"
        placeholder="Search Pokémon..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <Card className="w-full sm:w-2/3">
          <CardContent className="p-2 sm:p-4">
            <ScrollArea className="h-64 sm:h-96 w-full">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-4">
                {filteredPokemon.map((pokemon: PokemonListItem) => {
                  const pokemonId = getPokemonId(pokemon.url);
                  return (
                    <motion.div
                      key={pokemon.name}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Card
                        className="cursor-pointer transition-all duration-200 dark:hover:bg-gray-700 hover:bg-gray-100"
                        onClick={() => handlePokemonSelect(pokemon.name)}
                      >
                        <CardContent className="p-1 sm:p-2 text-center">
                          <Image
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`}
                            alt={pokemon.name}
                            width={64}
                            height={64}
                            className="mx-auto pixelated"
                          />
                          <p className="mt-1 text-xs sm:text-sm font-semibold capitalize truncate">
                            {pokemon.name}
                          </p>
                          <Badge
                            variant="secondary"
                            className="mt-1 text-[10px] sm:text-xs"
                          >
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
        <Card className="w-full sm:w-1/3">
          <CardContent className="p-2 sm:p-4">
            <h3 className="text-lg font-semibold mb-2 sm:mb-4">Your Team</h3>
            <AnimatePresence>
              {selectedTeam.map((pokemon, index) => (
                <motion.div
                  key={pokemon.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between mb-2 p-2 rounded-lg dark:bg-gray-700 bg-gray-100"
                >
                  <div className="flex items-center">
                    <Image
                      src={pokemon.sprites.front_default}
                      alt={pokemon.name}
                      width={40}
                      height={40}
                      className="pixelated"
                    />
                    <div className="ml-2">
                      <p className="font-semibold capitalize text-xs sm:text-sm">
                        {pokemon.name}
                      </p>
                      <div className="flex space-x-1 mt-1">
                        {pokemon.types.map((type) => (
                          <Badge
                            key={type.type.name}
                            className={`${typeColors[type.type.name]} text-white text-[10px] sm:text-xs`}
                          >
                            {type.type.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePokemonRemove(index)}
                    className="h-6 w-6"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
            <Button
              onClick={handleTeamConfirm}
              disabled={selectedTeam.length !== 3}
              className="mt-2 w-full text-sm"
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
