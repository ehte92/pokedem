import React, { useState } from 'react';

import { PokemonDetails } from '@/lib/types';

import PokemonSelector from './pokemon-selector';
import TeamAnalysis from './team-analysis';
import TeamMember from './team-member';
import { Card, CardContent } from './ui/card';

const MAX_TEAM_SIZE = 6;

const TeamBuilder: React.FC = () => {
  const [team, setTeam] = useState<PokemonDetails[]>([]);

  const addToTeam = (pokemon: PokemonDetails) => {
    if (team.length < MAX_TEAM_SIZE) {
      setTeam([...team, pokemon]);
    } else {
      alert('Your team is already full!');
    }
  };

  const removeFromTeam = (index: number) => {
    setTeam(team.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Select Pokémon
          </h2>
          <PokemonSelector onSelect={addToTeam} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Your Team</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {team.map((pokemon, index) => (
              <TeamMember
                key={index}
                pokemon={pokemon}
                onRemove={() => removeFromTeam(index)}
              />
            ))}
            {[...Array(MAX_TEAM_SIZE - team.length)].map((_, index) => (
              <div
                key={index}
                className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg h-32 sm:h-40 flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm sm:text-base"
              >
                Empty Slot
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <TeamAnalysis team={team} />
    </div>
  );
};

export default TeamBuilder;
