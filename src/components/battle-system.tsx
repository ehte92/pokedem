import React from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useQueries } from 'react-query';

import { useBattleLogic } from '@/hooks/use-battle-logic';
import { fetchMoveDetails } from '@/lib/api';
import { getTypeColor } from '@/lib/pokemon-utils';
import { MoveDetails, PokemonDetails } from '@/lib/types';

import BattleArena from './battle-arena';
import PokemonSwitcher from './pokemin-switcher';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

interface BattleSystemProps {
  userTeam: PokemonDetails[];
  aiTeam: PokemonDetails[];
  onReset: () => void;
}

const BattleSystem: React.FC<BattleSystemProps> = ({
  userTeam,
  aiTeam,
  onReset,
}) => {
  const router = useRouter();

  const {
    userActivePokemon,
    aiActivePokemon,
    userTeamState,
    aiTeamState,
    battleLog,
    isSwitching,
    setIsSwitching,
    attackAnimation,
    handleUserMove,
    handleSwitch,
    userMove,
    battleState,
    handleBattleEnd,
    statusChangeAnimation,
    switchAnimation,
    faintAnimation,
  } = useBattleLogic(userTeam, aiTeam);

  const moveQueries = useQueries(
    userActivePokemon?.moves.slice(0, 4).map((move) => ({
      queryKey: ['moveDetails', move.move.name],
      queryFn: () => fetchMoveDetails(move.move.name),
      enabled: !!userActivePokemon,
    })) ?? []
  );

  const renderTeamStatus = () => (
    <div className="flex justify-between mb-2 text-sm sm:text-base">
      <div>
        <span className="font-bold">Your team:</span>{' '}
        {userTeamState.filter((p) => p.currentHP > 0).length} Pokémon left
      </div>
      <div>
        <span className="font-bold">AI team:</span>{' '}
        {aiTeamState.filter((p) => p.currentHP > 0).length} Pokémon left
      </div>
    </div>
  );

  const renderMoveSelection = () => {
    if (!userActivePokemon) return null;

    return (
      <div className="grid grid-cols-2 gap-2 mb-2">
        {userActivePokemon.moves.slice(0, 4).map((move, index) => {
          const moveDetails = moveQueries[index].data as
            | MoveDetails
            | undefined;

          return (
            <Button
              key={move.move.name}
              onClick={() => handleUserMove(move.move.name)}
              disabled={!!userMove || battleState !== 'active'}
              className="capitalize bg-blue-500 text-white hover:bg-blue-600 transition-colors flex flex-col items-start p-1 sm:p-2 h-auto text-xs sm:text-sm"
            >
              <span className="truncate w-full">{move.move.name}</span>
              <div className="flex justify-between w-full mt-1 text-[10px] sm:text-xs">
                <span>
                  PP: {move.pp}/{move.maxPp}
                </span>
                {moveDetails && (
                  <Badge
                    style={{
                      backgroundColor: getTypeColor(moveDetails.type.name),
                      color: 'white',
                    }}
                    className="text-[10px] sm:text-xs px-1 py-0"
                  >
                    {moveDetails.type.name}
                  </Badge>
                )}
              </div>
            </Button>
          );
        })}
      </div>
    );
  };

  const renderBattleControls = () => (
    <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
      <Button
        onClick={() => setIsSwitching(true)}
        disabled={!!userMove || battleState !== 'active'}
        className="bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
      >
        Switch
      </Button>
      <Button
        className="bg-red-500 text-white hover:bg-red-600 transition-colors"
        onClick={handleBattleEnd}
        disabled={battleState !== 'active'}
      >
        Forfeit
      </Button>
    </div>
  );

  const renderBattleLog = () => (
    <Card className="mt-2">
      <CardContent className="p-2">
        <h4 className="font-bold mb-1 text-sm">Battle Log:</h4>
        <ScrollArea className="h-24 sm:h-32">
          <AnimatePresence>
            {battleLog.slice(-5).map((log, index) => (
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="mb-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400"
              >
                {log}
              </motion.p>
            ))}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  const handleNavigateHome = () => {
    router.push('/');
  };

  const renderBattleResult = () => {
    const resultMessage = battleLog[battleLog.length - 1];
    const isVictory = resultMessage.includes('You won the battle!');

    return (
      <Card className="w-full max-w-sm mx-auto">
        <CardContent className="text-center p-4">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            {isVictory ? 'Victory!' : 'Defeat'}
          </h2>
          <p className="text-sm sm:text-base mb-4">{resultMessage}</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-2">
            <Button onClick={onReset} className="text-sm">
              New Battle
            </Button>
            <Button onClick={handleNavigateHome} className="text-sm">
              Home
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (battleState === 'initializing') {
    return (
      <Card className="w-full max-w-sm mx-auto">
        <CardContent>
          <p className="text-center font-bold text-lg">
            Initializing battle...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (battleState === 'ended') {
    return renderBattleResult();
  }

  if (!userActivePokemon || !aiActivePokemon) {
    return (
      <Card className="w-full max-w-sm mx-auto">
        <CardContent>
          <p className="text-center font-bold text-lg">Loading battle...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto overflow-hidden">
      <CardContent className="p-2 sm:p-4">
        {renderTeamStatus()}
        <BattleArena
          userActivePokemon={userActivePokemon}
          aiActivePokemon={aiActivePokemon}
          attackAnimation={attackAnimation}
          statusChangeAnimation={statusChangeAnimation}
          switchAnimation={switchAnimation}
          faintAnimation={faintAnimation}
        />
        {isSwitching ? (
          <PokemonSwitcher
            team={userTeamState.filter((p) => p.currentHP > 0)}
            activePokemon={userActivePokemon}
            onSwitch={handleSwitch}
            onCancel={() => setIsSwitching(false)}
          />
        ) : (
          <>
            {renderMoveSelection()}
            {renderBattleControls()}
          </>
        )}
        {renderBattleLog()}
      </CardContent>
    </Card>
  );
};

export default BattleSystem;
