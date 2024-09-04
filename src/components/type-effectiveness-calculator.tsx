'use client';

import React, { useMemo, useState } from 'react';

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
import { TYPE_EFFECTIVENESS } from '@/lib/constants';

import TypeChart from './type-chart';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('offensive');

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

  const filteredTypes = useMemo(() => {
    return POKEMON_TYPES.filter((type) =>
      type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const renderDefensiveEffectiveness = () => {
    if (!selectedType1) return null;

    const effectiveness = selectedType2
      ? getDualTypeEffectiveness(selectedType1, selectedType2)
      : getTypeEffectiveness(selectedType1);

    return (
      <div className="space-y-4">
        {renderTypeList(effectiveness.immuneTo, 0, 'Takes no damage from')}
        {renderTypeList(
          effectiveness.superResistant,
          0.25,
          'Takes ¼ damage from'
        )}
        {renderTypeList(effectiveness.resistant, 0.5, 'Takes ½ damage from')}
        {renderTypeList(effectiveness.weakTo, 2, 'Takes 2× damage from')}
        {renderTypeList(effectiveness.superWeakTo, 4, 'Takes 4× damage from')}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-lg sm:text-xl md:text-2xl">
          Pokémon Type Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger
              value="offensive"
              className="text-[10px] xs:text-xs sm:text-sm px-1 py-1 xs:px-2 xs:py-2"
            >
              <span className="block xs:hidden">Off</span>
              <span className="hidden xs:block">Offensive</span>
            </TabsTrigger>
            <TabsTrigger
              value="defensive"
              className="text-[10px] xs:text-xs sm:text-sm px-1 py-1 xs:px-2 xs:py-2"
            >
              <span className="block xs:hidden">Def</span>
              <span className="hidden xs:block">Defensive</span>
            </TabsTrigger>
            <TabsTrigger
              value="chart"
              className="text-[10px] xs:text-xs sm:text-sm px-1 py-1 xs:px-2 xs:py-2"
            >
              <span className="block xs:hidden">Chart</span>
              <span className="hidden xs:block">Type Chart</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="offensive">
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 mb-4">
              <Select
                onValueChange={(value: PokemonType) => setSelectedType1(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select first type" />
                </SelectTrigger>
                <SelectContent>
                  <div className="mb-2 px-2">
                    <Input
                      placeholder="Search types..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="mb-2"
                    />
                  </div>
                  {filteredTypes.map((type) => (
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
                  className="mt-4"
                >
                  <h2 className="text-base sm:text-lg font-bold mb-2 sm:mb-4 text-center">
                    <motion.span
                      className={`inline-block ${typeColors[selectedType1]} text-white px-2 py-1 rounded text-xs sm:text-sm`}
                    >
                      {selectedType1}
                    </motion.span>
                    {selectedType2 && (
                      <>
                        <span className="mx-1 sm:mx-2">/</span>
                        <motion.span
                          className={`inline-block ${typeColors[selectedType2]} text-white px-2 py-1 rounded text-xs sm:text-sm`}
                        >
                          {selectedType2}
                        </motion.span>
                      </>
                    )}
                    <span className="block mt-1 sm:mt-2 text-sm sm:text-base">
                      Type Effectiveness
                    </span>
                  </h2>
                  <div className="space-y-3 sm:space-y-6">
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
                                'No effect against'
                              )}
                              {renderTypeList(
                                effectiveness.superResistant,
                                0.25,
                                'Not very effective (¼×)'
                              )}
                              {renderTypeList(
                                effectiveness.resistant,
                                0.5,
                                'Not very effective (½×)'
                              )}
                              {renderTypeList(
                                effectiveness.weakTo,
                                2,
                                'Super effective (2×)'
                              )}
                              {renderTypeList(
                                effectiveness.superWeakTo,
                                4,
                                'Super effective (4×)'
                              )}
                            </>
                          );
                        })()
                      : (() => {
                          const effectiveness =
                            getTypeEffectiveness(selectedType1);
                          return (
                            <>
                              {renderTypeList(
                                effectiveness.immuneTo,
                                0,
                                'No effect against'
                              )}
                              {renderTypeList(
                                effectiveness.superResistant,
                                0.25,
                                'Not very effective (¼×)'
                              )}
                              {renderTypeList(
                                effectiveness.resistant,
                                0.5,
                                'Not very effective (½×)'
                              )}
                              {renderTypeList(
                                effectiveness.weakTo,
                                2,
                                'Super effective (2×)'
                              )}
                              {renderTypeList(
                                effectiveness.superWeakTo,
                                4,
                                'Super effective (4×)'
                              )}
                            </>
                          );
                        })()}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
          <TabsContent value="defensive">
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 mb-4">
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
            {renderDefensiveEffectiveness()}
          </TabsContent>
          <TabsContent value="chart">
            <div className="mt-4">
              <TypeChart />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TypeEffectivenessCalculator;
