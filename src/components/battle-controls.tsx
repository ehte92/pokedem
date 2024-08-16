import React from 'react';

import { PokemonBattleState } from '@/lib/types';

import PokemonSwitcher from './pokemin-switcher';
import { Button } from './ui/button';

interface BattleControlsProps {
  userPokemon: PokemonBattleState;
  isSwitching: boolean;
  userTeamState: PokemonBattleState[];
  handleUserMove: (moveName: string) => void;
  handleSwitch: (pokemon: PokemonBattleState) => void;
  userMove: string | null;
}

const BattleControls: React.FC<BattleControlsProps> = ({
  userPokemon,
  isSwitching,
  userTeamState,
  handleUserMove,
  handleSwitch,
  userMove,
}) => {
  if (
    isSwitching ||
    (!userPokemon && userTeamState.some((p) => p.currentHP > 0))
  ) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4">
        <h4 className="font-bold mb-3 text-gray-800 dark:text-gray-200">
          {userPokemon ? 'Switch Pokémon:' : 'Send out next Pokémon:'}
        </h4>
        <PokemonSwitcher
          team={userTeamState.filter((p) => p.currentHP > 0)}
          activePokemon={userPokemon}
          onSwitch={handleSwitch}
        />
      </div>
    );
  }

  if (userPokemon) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {userPokemon.moves.slice(0, 4).map((move) => (
            <Button
              key={move.move.name}
              onClick={() => handleUserMove(move.move.name)}
              disabled={!!userMove}
              className="capitalize bg-blue-500 dark:bg-blue-700 text-white hover:bg-blue-600 dark:hover:bg-blue-800 transition-colors"
            >
              {move.move.name}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => handleSwitch(userPokemon)}
            disabled={!!userMove}
            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Switch Pokémon
          </Button>
          <Button
            className="bg-red-500 dark:bg-red-700 text-white hover:bg-red-600 dark:hover:bg-red-800 transition-colors"
            disabled={true}
          >
            Forfeit
          </Button>
        </div>
      </div>
    );
  }

  return (
    <p className="text-center font-bold text-xl text-gray-800 dark:text-gray-200">
      Battle has ended
    </p>
  );
};

export default BattleControls;
