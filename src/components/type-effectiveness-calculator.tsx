'use client';

import React, { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const POKEMON_TYPES = [
  'Normal',
  'Fire',
  'Water',
  'Electric',
  'Grass',
  'Ice',
  'Fighting',
  'Poison',
  'Ground',
  'Flying',
  'Psychic',
  'Bug',
  'Rock',
  'Ghost',
  'Dragon',
  'Dark',
  'Steel',
  'Fairy',
] as const;

type PokemonType = (typeof POKEMON_TYPES)[number];

type Effectiveness = 0 | 0.25 | 0.5 | 1 | 2 | 4;

type TypeEffectiveness = {
  [key in PokemonType]: {
    [key in PokemonType]: Effectiveness;
  };
};

const TYPE_EFFECTIVENESS: TypeEffectiveness = {
  Normal: {
    Normal: 1,
    Fire: 1,
    Water: 1,
    Electric: 1,
    Grass: 1,
    Ice: 1,
    Fighting: 2,
    Poison: 1,
    Ground: 1,
    Flying: 1,
    Psychic: 1,
    Bug: 1,
    Rock: 1,
    Ghost: 0,
    Dragon: 1,
    Dark: 1,
    Steel: 1,
    Fairy: 1,
  },
  Fire: {
    Normal: 1,
    Fire: 0.5,
    Water: 2,
    Electric: 1,
    Grass: 0.5,
    Ice: 0.5,
    Fighting: 1,
    Poison: 1,
    Ground: 2,
    Flying: 1,
    Psychic: 1,
    Bug: 0.5,
    Rock: 2,
    Ghost: 1,
    Dragon: 1,
    Dark: 1,
    Steel: 0.5,
    Fairy: 0.5,
  },
  Water: {
    Normal: 1,
    Fire: 0.5,
    Water: 0.5,
    Electric: 2,
    Grass: 2,
    Ice: 0.5,
    Fighting: 1,
    Poison: 1,
    Ground: 1,
    Flying: 1,
    Psychic: 1,
    Bug: 1,
    Rock: 1,
    Ghost: 1,
    Dragon: 1,
    Dark: 1,
    Steel: 0.5,
    Fairy: 1,
  },
  Electric: {
    Normal: 1,
    Fire: 1,
    Water: 1,
    Electric: 0.5,
    Grass: 0.5,
    Ice: 1,
    Fighting: 1,
    Poison: 1,
    Ground: 0,
    Flying: 2,
    Psychic: 1,
    Bug: 1,
    Rock: 1,
    Ghost: 1,
    Dragon: 1,
    Dark: 1,
    Steel: 1,
    Fairy: 1,
  },
  Grass: {
    Normal: 1,
    Fire: 2,
    Water: 0.5,
    Electric: 1,
    Grass: 0.5,
    Ice: 2,
    Fighting: 1,
    Poison: 2,
    Ground: 0.5,
    Flying: 2,
    Psychic: 1,
    Bug: 2,
    Rock: 1,
    Ghost: 1,
    Dragon: 1,
    Dark: 1,
    Steel: 1,
    Fairy: 1,
  },
  Ice: {
    Normal: 1,
    Fire: 2,
    Water: 1,
    Electric: 1,
    Grass: 1,
    Ice: 0.5,
    Fighting: 1,
    Poison: 1,
    Ground: 1,
    Flying: 1,
    Psychic: 1,
    Bug: 1,
    Rock: 2,
    Ghost: 1,
    Dragon: 1,
    Dark: 1,
    Steel: 2,
    Fairy: 1,
  },
  Fighting: {
    Normal: 1,
    Fire: 1,
    Water: 1,
    Electric: 1,
    Grass: 1,
    Ice: 1,
    Fighting: 1,
    Poison: 1,
    Ground: 1,
    Flying: 2,
    Psychic: 2,
    Bug: 0.5,
    Rock: 0.5,
    Ghost: 0,
    Dragon: 1,
    Dark: 0.5,
    Steel: 1,
    Fairy: 2,
  },
  Poison: {
    Normal: 1,
    Fire: 1,
    Water: 1,
    Electric: 1,
    Grass: 0.5,
    Ice: 1,
    Fighting: 1,
    Poison: 0.5,
    Ground: 2,
    Flying: 1,
    Psychic: 1,
    Bug: 1,
    Rock: 0.5,
    Ghost: 1,
    Dragon: 1,
    Dark: 1,
    Steel: 0,
    Fairy: 2,
  },
  Ground: {
    Normal: 1,
    Fire: 1,
    Water: 2,
    Electric: 2,
    Grass: 0.5,
    Ice: 1,
    Fighting: 1,
    Poison: 0.5,
    Ground: 1,
    Flying: 0,
    Psychic: 1,
    Bug: 1,
    Rock: 2,
    Ghost: 1,
    Dragon: 1,
    Dark: 1,
    Steel: 2,
    Fairy: 1,
  },
  Flying: {
    Normal: 1,
    Fire: 1,
    Water: 1,
    Electric: 0.5,
    Grass: 0.5,
    Ice: 2,
    Fighting: 0.5,
    Poison: 1,
    Ground: 1,
    Flying: 1,
    Psychic: 1,
    Bug: 0.5,
    Rock: 2,
    Ghost: 1,
    Dragon: 1,
    Dark: 1,
    Steel: 1,
    Fairy: 1,
  },
  Psychic: {
    Normal: 1,
    Fire: 1,
    Water: 1,
    Electric: 1,
    Grass: 1,
    Ice: 1,
    Fighting: 0.5,
    Poison: 1,
    Ground: 1,
    Flying: 1,
    Psychic: 0.5,
    Bug: 2,
    Rock: 1,
    Ghost: 1,
    Dragon: 1,
    Dark: 2,
    Steel: 0.5,
    Fairy: 1,
  },
  Bug: {
    Normal: 1,
    Fire: 2,
    Water: 1,
    Electric: 1,
    Grass: 0.5,
    Ice: 1,
    Fighting: 0.5,
    Poison: 1,
    Ground: 1,
    Flying: 2,
    Psychic: 1,
    Bug: 1,
    Rock: 1,
    Ghost: 1,
    Dragon: 1,
    Dark: 1,
    Steel: 1,
    Fairy: 0.5,
  },
  Rock: {
    Normal: 1,
    Fire: 0.5,
    Water: 2,
    Electric: 1,
    Grass: 1,
    Ice: 1,
    Fighting: 2,
    Poison: 1,
    Ground: 0.5,
    Flying: 0.5,
    Psychic: 1,
    Bug: 2,
    Rock: 1,
    Ghost: 1,
    Dragon: 1,
    Dark: 1,
    Steel: 2,
    Fairy: 1,
  },
  Ghost: {
    Normal: 0,
    Fire: 1,
    Water: 1,
    Electric: 1,
    Grass: 1,
    Ice: 1,
    Fighting: 1,
    Poison: 1,
    Ground: 1,
    Flying: 1,
    Psychic: 2,
    Bug: 1,
    Rock: 1,
    Ghost: 2,
    Dragon: 1,
    Dark: 0.5,
    Steel: 1,
    Fairy: 1,
  },
  Dragon: {
    Normal: 1,
    Fire: 1,
    Water: 1,
    Electric: 1,
    Grass: 1,
    Ice: 1,
    Fighting: 1,
    Poison: 1,
    Ground: 1,
    Flying: 1,
    Psychic: 1,
    Bug: 1,
    Rock: 1,
    Ghost: 1,
    Dragon: 2,
    Dark: 1,
    Steel: 0.5,
    Fairy: 0,
  },
  Dark: {
    Normal: 1,
    Fire: 1,
    Water: 1,
    Electric: 1,
    Grass: 1,
    Ice: 1,
    Fighting: 2,
    Poison: 1,
    Ground: 1,
    Flying: 1,
    Psychic: 0,
    Bug: 1,
    Rock: 1,
    Ghost: 2,
    Dragon: 1,
    Dark: 0.5,
    Steel: 1,
    Fairy: 0.5,
  },
  Steel: {
    Normal: 1,
    Fire: 2,
    Water: 1,
    Electric: 1,
    Grass: 1,
    Ice: 0.5,
    Fighting: 1,
    Poison: 1,
    Ground: 1,
    Flying: 1,
    Psychic: 1,
    Bug: 1,
    Rock: 2,
    Ghost: 1,
    Dragon: 1,
    Dark: 1,
    Steel: 0.5,
    Fairy: 2,
  },
  Fairy: {
    Normal: 1,
    Fire: 1,
    Water: 1,
    Electric: 1,
    Grass: 1,
    Ice: 1,
    Fighting: 0.5,
    Poison: 0.5,
    Ground: 1,
    Flying: 1,
    Psychic: 1,
    Bug: 1,
    Rock: 1,
    Ghost: 1,
    Dragon: 2,
    Dark: 2,
    Steel: 0.5,
    Fairy: 1,
  },
};

const typeColors: { [key in PokemonType]: string } = {
  Normal: 'bg-gray-400',
  Fire: 'bg-red-500',
  Water: 'bg-blue-500',
  Electric: 'bg-yellow-400',
  Grass: 'bg-green-500',
  Ice: 'bg-blue-200',
  Fighting: 'bg-red-700',
  Poison: 'bg-purple-500',
  Ground: 'bg-yellow-600',
  Flying: 'bg-indigo-400',
  Psychic: 'bg-pink-500',
  Bug: 'bg-green-400',
  Rock: 'bg-yellow-700',
  Ghost: 'bg-purple-700',
  Dragon: 'bg-indigo-700',
  Dark: 'bg-gray-700',
  Steel: 'bg-gray-400',
  Fairy: 'bg-pink-300',
};

const EffectivenessBadge: React.FC<{
  type: PokemonType;
  effectiveness: Effectiveness;
}> = ({ type, effectiveness }) => {
  const getEffectivenessColor = (eff: Effectiveness) => {
    switch (eff) {
      case 0:
        return 'bg-gray-500';
      case 0.25:
        return 'bg-red-800';
      case 0.5:
        return 'bg-red-500';
      case 1:
        return 'bg-gray-400';
      case 2:
        return 'bg-green-500';
      case 4:
        return 'bg-green-800';
    }
  };

  const getEffectivenessText = (eff: Effectiveness) => {
    switch (eff) {
      case 0:
        return 'No effect';
      case 0.25:
        return '¼×';
      case 0.5:
        return '½×';
      case 1:
        return '1×';
      case 2:
        return '2×';
      case 4:
        return '4×';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Badge
              className={`${typeColors[type]} ${getEffectivenessColor(effectiveness)} text-white text-xs sm:text-sm m-1 px-2 py-1`}
            >
              {type}
            </Badge>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getEffectivenessText(effectiveness)} damage</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const TypeEffectivenessCalculator: React.FC = () => {
  const [selectedType1, setSelectedType1] = useState<PokemonType | ''>('');
  const [selectedType2, setSelectedType2] = useState<PokemonType | ''>('');

  const renderTypeList = (
    types: PokemonType[],
    effectiveness: Effectiveness,
    title: string
  ) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-4"
    >
      <h3 className="font-semibold mb-2 text-sm sm:text-base">{title}:</h3>
      <div className="flex flex-wrap">
        {types.map((type) => (
          <EffectivenessBadge
            key={type}
            type={type}
            effectiveness={effectiveness}
          />
        ))}
      </div>
    </motion.div>
  );

  const getTypeEffectiveness = (type: PokemonType) => {
    const effectiveness = TYPE_EFFECTIVENESS[type];
    return {
      immuneTo: Object.entries(effectiveness)
        .filter(([_, eff]) => eff === 0)
        .map(([t]) => t as PokemonType),
      superResistant: Object.entries(effectiveness)
        .filter(([_, eff]) => eff === 0.25)
        .map(([t]) => t as PokemonType),
      resistant: Object.entries(effectiveness)
        .filter(([_, eff]) => eff === 0.5)
        .map(([t]) => t as PokemonType),
      weakTo: Object.entries(effectiveness)
        .filter(([_, eff]) => eff === 2)
        .map(([t]) => t as PokemonType),
      superWeakTo: Object.entries(effectiveness)
        .filter(([_, eff]) => eff === 4)
        .map(([t]) => t as PokemonType),
    };
  };

  const getDualTypeEffectiveness = (type1: PokemonType, type2: PokemonType) => {
    const effectiveness1 = TYPE_EFFECTIVENESS[type1];
    const effectiveness2 = TYPE_EFFECTIVENESS[type2];

    const combinedEffectiveness: { [key in PokemonType]: Effectiveness } = {
      Normal: 1,
      Fire: 1,
      Water: 1,
      Electric: 1,
      Grass: 1,
      Ice: 1,
      Fighting: 1,
      Poison: 1,
      Ground: 1,
      Flying: 1,
      Psychic: 1,
      Bug: 1,
      Rock: 1,
      Ghost: 1,
      Dragon: 1,
      Dark: 1,
      Steel: 1,
      Fairy: 1,
    };

    POKEMON_TYPES.forEach((type) => {
      const eff1 = effectiveness1[type];
      const eff2 = effectiveness2[type];
      combinedEffectiveness[type] = (eff1 * eff2) as Effectiveness;
    });

    return {
      immuneTo: Object.entries(combinedEffectiveness)
        .filter(([_, eff]) => eff === 0)
        .map(([t]) => t as PokemonType),
      superResistant: Object.entries(combinedEffectiveness)
        .filter(([_, eff]) => eff === 0.25)
        .map(([t]) => t as PokemonType),
      resistant: Object.entries(combinedEffectiveness)
        .filter(([_, eff]) => eff === 0.5)
        .map(([t]) => t as PokemonType),
      weakTo: Object.entries(combinedEffectiveness)
        .filter(([_, eff]) => eff === 2)
        .map(([t]) => t as PokemonType),
      superWeakTo: Object.entries(combinedEffectiveness)
        .filter(([_, eff]) => eff === 4)
        .map(([t]) => t as PokemonType),
    };
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-xl sm:text-2xl">
          Type Effectiveness Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select
            onValueChange={(value: PokemonType) => setSelectedType1(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select first type" />
            </SelectTrigger>
            <SelectContent>
              {POKEMON_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            onValueChange={(value: PokemonType | 'none') =>
              setSelectedType2(value === 'none' ? '' : value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select second type (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {POKEMON_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <AnimatePresence>
          {selectedType1 && (
            <motion.div
              key={`${selectedType1}-${selectedType2}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mt-6"
            >
              <h2 className="text-lg sm:text-xl font-bold mb-4 text-center">
                <motion.span
                  className={`inline-block ${typeColors[selectedType1]} text-white px-2 py-1 rounded`}
                >
                  {selectedType1}
                </motion.span>
                {selectedType2 && (
                  <>
                    <span className="mx-2">/</span>
                    <motion.span
                      className={`inline-block ${typeColors[selectedType2]} text-white px-2 py-1 rounded`}
                    >
                      {selectedType2}
                    </motion.span>
                  </>
                )}
                <span className="block mt-2">Type Effectiveness</span>
              </h2>
              <div className="space-y-6">
                {selectedType2
                  ? (() => {
                      const effectiveness = getDualTypeEffectiveness(
                        selectedType1,
                        selectedType2
                      );
                      return (
                        <>
                          {renderTypeList(
                            effectiveness.immuneTo,
                            0,
                            'Immune to'
                          )}
                          {renderTypeList(
                            effectiveness.superResistant,
                            0.25,
                            'Super Resistant to'
                          )}
                          {renderTypeList(
                            effectiveness.resistant,
                            0.5,
                            'Resistant to'
                          )}
                          {renderTypeList(effectiveness.weakTo, 2, 'Weak to')}
                          {renderTypeList(
                            effectiveness.superWeakTo,
                            4,
                            'Super Weak to'
                          )}
                        </>
                      );
                    })()
                  : (() => {
                      const effectiveness = getTypeEffectiveness(selectedType1);
                      return (
                        <>
                          {renderTypeList(
                            effectiveness.immuneTo,
                            0,
                            'Immune to'
                          )}
                          {renderTypeList(
                            effectiveness.superResistant,
                            0.25,
                            'Super Resistant to'
                          )}
                          {renderTypeList(
                            effectiveness.resistant,
                            0.5,
                            'Resistant to'
                          )}
                          {renderTypeList(effectiveness.weakTo, 2, 'Weak to')}
                          {renderTypeList(
                            effectiveness.superWeakTo,
                            4,
                            'Super Weak to'
                          )}
                        </>
                      );
                    })()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default TypeEffectivenessCalculator;
