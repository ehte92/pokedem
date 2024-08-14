import React from 'react';

import { AlertTriangle, CheckCircle, Shield } from 'lucide-react';

import { TypeEffectiveness, typeEffectiveness } from '@/lib/constants';
import { PokemonDetails } from '@/lib/types';

import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';

interface TeamAnalysisProps {
  team: PokemonDetails[];
}

const typeColors: { [key: string]: string } = {
  normal: 'bg-gray-400',
  fire: 'bg-red-500',
  water: 'bg-blue-500',
  electric: 'bg-yellow-400',
  grass: 'bg-green-500',
  ice: 'bg-blue-200',
  fighting: 'bg-red-700',
  poison: 'bg-purple-500',
  ground: 'bg-yellow-600',
  flying: 'bg-indigo-400',
  psychic: 'bg-pink-500',
  bug: 'bg-green-400',
  rock: 'bg-yellow-700',
  ghost: 'bg-purple-700',
  dragon: 'bg-indigo-700',
  dark: 'bg-gray-700',
  steel: 'bg-gray-400',
  fairy: 'bg-pink-300',
};

const TeamAnalysis: React.FC<TeamAnalysisProps> = ({ team }) => {
  const types = team.flatMap((pokemon) =>
    pokemon.types.map((t) => t.type.name)
  );
  const uniqueTypes = Array.from(new Set(types));

  const typeCount = types.reduce(
    (acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const calculateTypeEffectiveness = () => {
    const effectiveness: TypeEffectiveness = {
      weaknesses: {},
      resistances: {},
      immunities: {},
    };

    uniqueTypes.forEach((type) => {
      Object.entries(typeEffectiveness[type]).forEach(
        ([attackType, multiplier]) => {
          if (multiplier > 1) {
            effectiveness.weaknesses[attackType] =
              (effectiveness.weaknesses[attackType] || 0) + 1;
          } else if (multiplier === 0) {
            effectiveness.immunities[attackType] =
              (effectiveness.immunities[attackType] || 0) + 1;
          } else if (multiplier < 1) {
            effectiveness.resistances[attackType] =
              (effectiveness.resistances[attackType] || 0) + 1;
          }
        }
      );
    });

    return effectiveness;
  };

  const teamEffectiveness = calculateTypeEffectiveness();

  const renderTypeEffectiveness = (
    effectivenessType: 'weaknesses' | 'resistances' | 'immunities'
  ) => {
    const effectivenessData = teamEffectiveness[effectivenessType];
    return Object.entries(effectivenessData)
      .sort(([, a], [, b]) => b - a)
      .map(([type, count]) => (
        <Badge
          key={type}
          className={`${typeColors[type]} text-white mr-2 mb-2`}
        >
          {type} ({count})
        </Badge>
      ));
  };

  const getTeamBalanceIcon = () => {
    if (team.length < 6) return <AlertTriangle className="text-yellow-500" />;
    if (uniqueTypes.length < 6) return <Shield className="text-blue-500" />;
    return <CheckCircle className="text-green-500" />;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Team Analysis</span>
          {getTeamBalanceIcon()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Team Composition</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Pokémon Count
                </p>
                <p className="text-2xl font-bold">{team.length} / 6</p>
                <Progress value={(team.length / 6) * 100} className="mt-2" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Type Variety
                </p>
                <p className="text-2xl font-bold">{uniqueTypes.length}</p>
                <Progress
                  value={(uniqueTypes.length / 18) * 100}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-xl font-semibold mb-2">Type Distribution</h3>
            <div className="flex flex-wrap">
              {Object.entries(typeCount).map(([type, count]) => (
                <Badge
                  key={type}
                  className={`${typeColors[type]} text-white mr-2 mb-2`}
                >
                  {type} ({count})
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-xl font-semibold mb-2">Type Effectiveness</h3>
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-red-500 dark:text-red-400 mb-1">
                  Weaknesses:
                </p>
                <div className="flex flex-wrap">
                  {renderTypeEffectiveness('weaknesses')}
                </div>
              </div>
              <div>
                <p className="font-semibold text-green-500 dark:text-green-400 mb-1">
                  Resistances:
                </p>
                <div className="flex flex-wrap">
                  {renderTypeEffectiveness('resistances')}
                </div>
              </div>
              <div>
                <p className="font-semibold text-blue-500 dark:text-blue-400 mb-1">
                  Immunities:
                </p>
                <div className="flex flex-wrap">
                  {renderTypeEffectiveness('immunities')}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-xl font-semibold mb-2">Team Balance</h3>
            <p className="text-gray-700 dark:text-gray-300">
              {team.length < 6
                ? `Your team has ${team.length} Pokémon. Consider adding ${
                    6 - team.length
                  } more for a full team.`
                : 'You have a full team of 6 Pokémon.'}
            </p>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              {uniqueTypes.length < 6
                ? `Your team covers ${uniqueTypes.length} different types. Consider adding more type variety for better coverage.`
                : 'Your team has excellent type variety!'}
            </p>
            {Object.keys(teamEffectiveness.weaknesses).length > 3 && (
              <p className="mt-2 text-yellow-600 dark:text-yellow-400 flex items-center">
                <AlertTriangle className="mr-2" />
                Your team has several common weaknesses. Consider adding Pokémon
                that can cover these weaknesses.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamAnalysis;
