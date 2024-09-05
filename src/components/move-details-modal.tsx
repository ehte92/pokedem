import React, { useEffect, useRef } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Brain,
  Bug,
  Cog,
  Crosshair,
  Droplets,
  Zap as Electric,
  Flame,
  Gem,
  Ghost,
  Heart,
  Leaf,
  Maximize2,
  Minimize2,
  Moon,
  Mountain,
  Repeat,
  RotateCcw,
  Shield,
  ShieldAlert,
  Skull,
  Snowflake,
  Sparkles,
  Swords,
  Target,
  Waves,
  Wind,
  X,
  Zap,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { typeColors } from '@/lib/constants';
import { MoveDetails } from '@/lib/types';

interface MoveDetailsModalProps {
  move: MoveDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

const backdrop = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

const modal = {
  hidden: {
    y: '-100vh',
    opacity: 0,
  },
  visible: {
    y: '0',
    opacity: 1,
    transition: {
      delay: 0.1,
      duration: 0.3,
      type: 'spring',
      damping: 25,
      stiffness: 500,
    },
  },
};

const typeIcons: { [key: string]: React.ReactNode } = {
  normal: <Target className="w-5 h-5" />,
  fire: <Flame className="w-5 h-5 text-red-500" />,
  water: <Droplets className="w-5 h-5 text-blue-500" />,
  electric: <Electric className="w-5 h-5 text-yellow-400" />,
  grass: <Leaf className="w-5 h-5 text-green-500" />,
  ice: <Snowflake className="w-5 h-5 text-blue-300" />,
  fighting: <Swords className="w-5 h-5 text-red-700" />,
  poison: <Skull className="w-5 h-5 text-purple-500" />,
  ground: <Mountain className="w-5 h-5 text-yellow-700" />,
  flying: <Wind className="w-5 h-5 text-blue-400" />,
  psychic: <Brain className="w-5 h-5 text-pink-500" />,
  bug: <Bug className="w-5 h-5 text-green-600" />,
  rock: <Gem className="w-5 h-5 text-yellow-800" />,
  ghost: <Ghost className="w-5 h-5 text-purple-700" />,
  dragon: <Waves className="w-5 h-5 text-indigo-600" />,
  dark: <Moon className="w-5 h-5 text-gray-800" />,
  steel: <Cog className="w-5 h-5 text-gray-500" />,
  fairy: <Heart className="w-5 h-5 text-pink-400" />,
};

const MoveDetailsModal: React.FC<MoveDetailsModalProps> = ({
  move,
  isOpen,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!move) return null;

  const getStatColor = (value: number | null, max: number) => {
    if (value === null) return 'bg-gray-300';
    const percentage = (value / max) * 100;
    if (percentage < 30) return 'bg-red-500';
    if (percentage < 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const renderStatBar = (
    label: string,
    value: number | null,
    max: number,
    icon: React.ReactNode
  ) => (
    <div className="mb-4">
      <div className="flex items-center mb-1">
        {icon}
        <p className="text-sm font-semibold ml-2">{label}</p>
      </div>
      <Progress
        value={value}
        max={max}
        className={`h-2 ${getStatColor(value, max)}`}
      />
      <p className="text-sm mt-1">
        {value ?? 'N/A'}
        {label === 'Accuracy' && value ? '%' : ''}
      </p>
    </div>
  );

  const renderInfoItem = (
    label: string,
    value: string | number,
    icon: React.ReactNode,
    tooltip: string
  ) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center p-2 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-default">
            {icon}
            <div className="ml-2">
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-sm">{value}</p>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          className="max-w-xs text-xs bg-gray-900 text-white p-2 rounded shadow-lg"
        >
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          variants={backdrop}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.div
            ref={modalRef}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            variants={modal}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold capitalize flex items-center">
                {typeIcons[move.type.name]}
                <span className="ml-2">{move.name.replace('-', ' ')}</span>
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={24} />
              </motion.button>
            </div>

            <div className="flex space-x-2 mb-4">
              <Badge
                className={`${typeColors[move.type.name]} text-white text-sm`}
              >
                {move.type.name}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {move.damage_class.name}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {renderStatBar(
                'Power',
                move.power,
                200,
                <Swords className="w-5 h-5 text-red-500" />
              )}
              {renderStatBar(
                'Accuracy',
                move.accuracy,
                100,
                <Target className="w-5 h-5 text-blue-500" />
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {renderInfoItem(
                'PP',
                move.pp,
                <Zap className="w-6 h-6 text-yellow-500" />,
                'Power Points: The number of times this move can be used'
              )}
              {renderInfoItem(
                'Priority',
                move.priority,
                <AlertTriangle className="w-6 h-6 text-blue-500" />,
                'Determines the order in which moves are executed'
              )}
              {renderInfoItem(
                'Target',
                move.target.name.replace('-', ' '),
                <Crosshair className="w-6 h-6 text-green-500" />,
                'Specifies which Pokémon this move can affect'
              )}
            </div>

            <Separator className="my-6" />

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
                Effect
              </h3>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-sm">{move.effect_entries[0]?.effect}</p>
              </div>
              {move.effect_chance && (
                <div className="mt-2 flex items-center">
                  <Repeat className="w-5 h-5 mr-2 text-orange-500" />
                  <p className="text-sm">
                    <span className="font-semibold">Effect Chance:</span>{' '}
                    {move.effect_chance}%
                  </p>
                </div>
              )}
            </div>

            {move.meta && (
              <>
                <Separator className="my-6" />
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <Cog className="w-5 h-5 mr-2 text-gray-500" />
                    Additional Info
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {move.meta.ailment.name !== 'none' &&
                      renderInfoItem(
                        'Ailment',
                        move.meta.ailment.name.replace('-', ' '),
                        <ShieldAlert className="w-5 h-5 text-red-500" />,
                        'Status condition this move may inflict'
                      )}
                    {(move.meta.min_hits || move.meta.max_hits) &&
                      renderInfoItem(
                        'Hits',
                        `${move.meta.min_hits || 1}-${move.meta.max_hits || 1}`,
                        <RotateCcw className="w-5 h-5 text-purple-500" />,
                        'Number of times this move hits in a single turn'
                      )}
                    {move.meta.drain !== 0 &&
                      renderInfoItem(
                        'Drain',
                        `${move.meta.drain}%`,
                        <Zap className="w-5 h-5 text-yellow-500" />,
                        'Percentage of damage dealt recovered as HP'
                      )}
                    {move.meta.healing !== 0 &&
                      renderInfoItem(
                        'Healing',
                        `${move.meta.healing}%`,
                        <Heart className="w-5 h-5 text-pink-500" />,
                        "Percentage of user's max HP recovered"
                      )}
                    {move.meta.crit_rate !== 0 &&
                      renderInfoItem(
                        'Crit Rate',
                        `+${move.meta.crit_rate}`,
                        <Target className="w-5 h-5 text-red-500" />,
                        'Stages added to critical hit ratio'
                      )}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MoveDetailsModal;
