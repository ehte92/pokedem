import React, { useEffect, useState } from 'react';

import Image from 'next/image';
import { useQuery } from 'react-query';

import { fetchPokemonDetails, fetchPokemonList } from '@/lib/api';
import { PokemonDetails } from '@/lib/types';

import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';

interface TeamSelectionProps {
  onTeamSelected: (team: PokemonDetails[]) => void;
}

interface PokemonListItem {
  name: string;
  url: string;
}

interface PokemonListResponse {
  results: PokemonListItem[];
}

const TeamSelection: React.FC<TeamSelectionProps> = ({ onTeamSelected }) => {
  const [selectedTeam, setSelectedTeam] = useState<PokemonDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: pokemonList } = useQuery<PokemonListResponse>(
    'pokemonList',
    () => fetchPokemonList(0, 151)
  );

  const filteredPokemon =
    pokemonList?.results.filter((pokemon) =>
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

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Select Your Team</h2>
      <Input
        type="text"
        placeholder="Search Pokémon..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      <div className="flex space-x-4">
        <ScrollArea className="h-96 w-1/2 border rounded">
          <div className="grid grid-cols-3 gap-2 p-2">
            {filteredPokemon.map((pokemon: PokemonListItem) => (
              <Card
                key={pokemon.name}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handlePokemonSelect(pokemon.name)}
              >
                <CardContent className="p-2 text-center">
                  <Image
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.url.split('/')[6]}.png`}
                    alt={pokemon.name}
                    width={64}
                    height={64}
                  />
                  <p className="text-sm mt-1 capitalize">{pokemon.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
        <div className="w-1/2">
          <h3 className="text-xl font-semibold mb-2">Your Team</h3>
          {selectedTeam.map((pokemon, index) => (
            <div key={index} className="flex items-center justify-between mb-2">
              <span className="capitalize">{pokemon.name}</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handlePokemonRemove(index)}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            onClick={handleTeamConfirm}
            disabled={selectedTeam.length !== 3}
            className="mt-4 w-full"
          >
            Confirm Team
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TeamSelection;
