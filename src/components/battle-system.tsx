import React from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useBattleLogic } from '@/hooks/use-battle-logic';
import { estimateLevel, getMaxHP } from '@/lib/pokemon-utils';
import { PokemonBattleState, PokemonDetails } from '@/lib/types';

import PokemonSwitcher from './pokemin-switcher';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

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
  } = useBattleLogic(userTeam, aiTeam);

  const renderHealthBar = (pokemon: PokemonBattleState) => {
    const hpPercentage = (pokemon.currentHP / getMaxHP(pokemon)) * 100;
    const barColor =
      hpPercentage > 50
        ? 'bg-green-500'
        : hpPercentage > 20
          ? 'bg-yellow-500'
          : 'bg-red-500';

    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
        <motion.div
          className={`h-2.5 rounded-full ${barColor}`}
          initial={{ width: '100%' }}
          animate={{ width: `${hpPercentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    );
  };

  const renderPokemonInfo = (pokemon: PokemonBattleState, isUser: boolean) => (
    <div
      className={`shadow-md rounded-lg p-3 ${isUser ? 'self-end' : 'self-start'} dark:bg-gray-800 bg-white`}
    >
      <div className="flex justify-between items-center">
        <span className="font-bold text-lg capitalize">{pokemon.name}</span>
        <span className="text-sm dark:text-gray-400 text-gray-600">
          Lv{estimateLevel(pokemon)}
        </span>
      </div>
      {renderHealthBar(pokemon)}
      <div className="flex justify-between items-center mt-1">
        <span className="text-sm dark:text-gray-400 text-gray-600">HP</span>
        <span className="text-sm dark:text-gray-400 text-gray-600">
          {pokemon.currentHP}/{getMaxHP(pokemon)}
        </span>
      </div>
      {pokemon.status && (
        <Badge variant="outline" className="mt-2">
          {pokemon.status}
        </Badge>
      )}
    </div>
  );

  const renderTeamStatus = () => (
    <div className="flex justify-between mb-4">
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

  const renderPokemonImage = (pokemon: PokemonBattleState, isUser: boolean) => {
    const imageUrl = isUser
      ? pokemon.sprites.back_default || pokemon.sprites.front_default
      : pokemon.sprites.front_default;

    return (
      <motion.div
        animate={
          attackAnimation === (isUser ? 'user' : 'ai')
            ? { x: [0, 10, -10, 10, 0], transition: { duration: 0.5 } }
            : {}
        }
      >
        <Image
          src={imageUrl}
          alt={pokemon.name}
          width={isUser ? 200 : 180}
          height={isUser ? 200 : 180}
          className="drop-shadow-lg"
        />
      </motion.div>
    );
  };

  const renderBattleArena = () => {
    if (!userActivePokemon || !aiActivePokemon) {
      return <div>Loading battle arena...</div>;
    }

    return (
      <div className="relative h-80 bg-gradient-to-b from-sky-400 to-sky-200 rounded-lg mb-6">
        <div className="absolute top-4 left-4 z-10">
          {renderPokemonInfo(aiActivePokemon, false)}
        </div>
        <div className="absolute top-4 right-4 z-20">
          {renderPokemonImage(aiActivePokemon, false)}
        </div>
        <div className="absolute bottom-4 right-4 z-10">
          {renderPokemonInfo(userActivePokemon, true)}
        </div>
        <div className="absolute bottom-4 left-4 z-20">
          {renderPokemonImage(userActivePokemon, true)}
        </div>
      </div>
    );
  };

  const renderMoveSelection = () => {
    if (!userActivePokemon) return null;

    return (
      <div className="grid grid-cols-2 gap-3 mb-4">
        {userActivePokemon.moves.slice(0, 4).map((move) => (
          <Button
            key={move.move.name}
            onClick={() => handleUserMove(move.move.name)}
            disabled={!!userMove || battleState !== 'active'}
            className="capitalize bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            {move.move.name} (PP: {move.pp}/{move.maxPp})
          </Button>
        ))}
      </div>
    );
  };

  const renderBattleControls = () => (
    <div className="grid grid-cols-2 gap-3">
      <Button
        onClick={() => setIsSwitching(true)}
        disabled={!!userMove || battleState !== 'active'}
        className="bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
      >
        Switch Pokémon
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
    <div className="mt-6 shadow-lg rounded-lg p-4 h-40 overflow-y-auto dark:bg-gray-800 bg-white">
      <h4 className="font-bold mb-2">Battle Log:</h4>
      <AnimatePresence>
        {battleLog.slice(-5).map((log, index) => (
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mb-1 text-sm dark:text-gray-400 text-gray-600"
          >
            {log}
          </motion.p>
        ))}
      </AnimatePresence>
    </div>
  );

  const handleNavigateHome = () => {
    router.push('/');
  };

  const renderBattleResult = () => {
    const resultMessage = battleLog[battleLog.length - 1];
    const isVictory = resultMessage.includes('You won the battle!');

    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="text-center p-6">
          <h2 className="text-3xl font-bold mb-4">
            {isVictory ? 'Victory!' : 'Defeat'}
          </h2>
          <p className="text-xl mb-6">{resultMessage}</p>
          <div className="flex justify-center space-x-4">
            <Button onClick={onReset} className="px-6 py-3 text-lg">
              Start New Battle
            </Button>
            <Button onClick={handleNavigateHome} className="px-6 py-3 text-lg">
              Return to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (battleState === 'initializing') {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent>
          <p className="text-center font-bold text-xl">
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
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent>
          <p className="text-center font-bold text-xl">Loading battle...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto overflow-hidden">
      <CardContent className="p-6">
        {renderTeamStatus()}
        {renderBattleArena()}
        {isSwitching ? (
          <PokemonSwitcher
            team={userTeamState.filter((p) => p.currentHP > 0)}
            activePokemon={userActivePokemon}
            onSwitch={handleSwitch}
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
