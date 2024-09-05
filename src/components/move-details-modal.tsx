import React, { useEffect, useRef } from 'react';

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
  Zap,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

const typeIcons: { [key: string]: React.ReactNode } = {
  normal: <Target className="w-5 h-5" />,
  fire: <Flame className="w-5 h-5 text-red-500" />,
  water: <Droplets className="w-5 h-5 text-blue-500" />,
  ice: <Snowflake className="w-5 h-5 text-blue-300" />,
  electric: <Electric className="w-5 h-5 text-yellow-400" />,
  grass: <Leaf className="w-5 h-5 text-green-500" />,
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

const effectIcons: { [key: string]: React.ReactNode } = {
  damage: <Swords className="w-5 h-5 text-red-500" />,
  'stat-change': <ArrowUpRight className="w-5 h-5 text-blue-500" />,
  'status-ailment': <ShieldAlert className="w-5 h-5 text-yellow-500" />,
  heal: <Heart className="w-5 h-5 text-green-500" />,
  drain: <Zap className="w-5 h-5 text-purple-500" />,
  'multi-hit': <RotateCcw className="w-5 h-5 text-orange-500" />,
  'critical-hit': <Target className="w-5 h-5 text-red-700" />,
  flinch: <Minimize2 className="w-5 h-5 text-gray-500" />,
  protect: <Shield className="w-5 h-5 text-blue-700" />,
  recoil: <ArrowDownRight className="w-5 h-5 text-red-600" />,
  'weather-effect': <Sparkles className="w-5 h-5 text-yellow-400" />,
  'field-effect': <Maximize2 className="w-5 h-5 text-green-600" />,
};

const MoveDetailsModal: React.FC<MoveDetailsModalProps> = ({
  move,
  isOpen,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();
    }
  }, [isOpen]);

  if (!move) return null;

  const getStatColor = (value: number | null, max: number) => {
    if (value === null) return 'bg-gray-300';
    const percentage = (value / max) * 100;
    if (percentage < 30) return 'bg-red-500';
    if (percentage < 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getEffectType = (effect: string): string => {
    if (effect.includes('damage')) return 'damage';
    if (effect.includes('raises') || effect.includes('lowers'))
      return 'stat-change';
    if (
      effect.includes('poisoned') ||
      effect.includes('burned') ||
      effect.includes('paralyzed')
    )
      return 'status-ailment';
    if (effect.includes('heal')) return 'heal';
    if (effect.includes('drain')) return 'drain';
    if (effect.includes('hits')) return 'multi-hit';
    if (effect.includes('critical hit')) return 'critical-hit';
    if (effect.includes('flinch')) return 'flinch';
    if (effect.includes('protect')) return 'protect';
    if (effect.includes('user is hurt')) return 'recoil';
    if (effect.includes('weather')) return 'weather-effect';
    if (effect.includes('terrain') || effect.includes('field'))
      return 'field-effect';
    return 'damage'; // default
  };

  const renderStatBar = (
    label: string,
    value: number | null,
    max: number,
    icon: React.ReactNode
  ) => (
    <div>
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
        {value || 'N/A'}
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
    <TooltipProvider delayDuration={300}>
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        ref={dialogRef}
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto focus:outline-none"
      >
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold capitalize flex items-center justify-between">
            <div className="flex items-center">
              {typeIcons[move.type.name]}
              <span className="ml-2">{move.name.replace('-', ' ')}</span>
            </div>
            <div className="flex space-x-2">
              <Badge
                className={`${typeColors[move.type.name]} text-white text-sm`}
              >
                {move.type.name}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {move.damage_class.name}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          <div className="grid grid-cols-2 gap-4">
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

          <div className="grid grid-cols-3 gap-4">
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

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
              Effect
            </h3>
            <div className="flex items-start bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
              {effectIcons[getEffectType(move.effect_entries[0]?.effect)]}
              <p className="text-sm ml-2">{move.effect_entries[0]?.effect}</p>
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
              <Separator />
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MoveDetailsModal;
