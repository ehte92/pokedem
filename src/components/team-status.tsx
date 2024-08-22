import { motion } from 'framer-motion';

import { PokemonBattleState } from '@/lib/types';

import { Badge } from './ui/badge';

interface TeamStatusProps {
  team: PokemonBattleState[];
  isUserTeam: boolean;
}

const TeamStatus: React.FC<TeamStatusProps> = ({ team, isUserTeam }) => {
  const activePokemon = team.filter((p) => p.currentHP > 0).length;

  return (
    <div
      className={`flex flex-col ${isUserTeam ? 'items-start' : 'items-end'}`}
    >
      <h3 className="text-sm font-semibold mb-1">
        {isUserTeam ? 'Your Team' : 'AI Team'}
      </h3>
      <div className="flex space-x-1">
        {team.map((pokemon, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Badge
              variant={pokemon.currentHP > 0 ? 'default' : 'secondary'}
              className="w-6 h-6 rounded-full flex items-center justify-center"
            >
              {pokemon.currentHP > 0 ? '✓' : '×'}
            </Badge>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TeamStatus;
