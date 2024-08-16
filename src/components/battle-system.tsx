import React from 'react';

import { useBattleLogic } from '@/hooks/use-battle-logic';
import { PokemonDetails } from '@/lib/types';

import BattleArena from './battle-arena';
import BattleControls from './battle-controls';
import BattleLog from './battle-log';
import { Card, CardContent } from './ui/card';

interface BattleSystemProps {
  userTeam: PokemonDetails[];
  aiTeam: PokemonDetails[];
}

const BattleSystem: React.FC<BattleSystemProps> = ({ userTeam, aiTeam }) => {
  const {
    userActivePokemon,
    aiActivePokemon,
    userTeamState,
    aiTeamState,
    battleLog,
    isSwitching,
    handleUserMove,
    handleSwitch,
    userMove,
  } = useBattleLogic(userTeam, aiTeam);

  if (!userActivePokemon || !aiActivePokemon) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent>
          <p className="text-center font-bold text-xl text-gray-800 dark:text-gray-200">
            {battleLog[battleLog.length - 1]}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto overflow-hidden">
      <CardContent className="p-6">
        <BattleArena
          userPokemon={userActivePokemon}
          aiPokemon={aiActivePokemon}
        />
        <BattleControls
          userPokemon={userActivePokemon}
          isSwitching={isSwitching}
          userTeamState={userTeamState}
          handleUserMove={handleUserMove}
          handleSwitch={handleSwitch}
          userMove={userMove}
        />
        <BattleLog battleLog={battleLog} />
      </CardContent>
    </Card>
  );
};

export default BattleSystem;
