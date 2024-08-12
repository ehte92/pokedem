'use client';

import React, { useEffect, useState } from 'react';

import * as Tooltip from '@radix-ui/react-tooltip';
import { ArrowLeftCircle, Ruler, Star, Weight, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from 'react-query';

import EvolutionChainComponent from '@/components/evolution-chain';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  fetchAbilityDetails,
  fetchEvolutionChain,
  fetchPokemonDetails,
  fetchPokemonSpecies,
} from '@/lib/api';
import { typeColors } from '@/lib/constants';
import {
  AbilityDetails,
  EvolutionChain,
  PokemonDetails,
  PokemonSpecies,
} from '@/lib/types';

// Type effectiveness data
const typeEffectiveness = {
  normal: { weaknesses: ['fighting'], strengths: [] },
  fire: {
    weaknesses: ['water', 'ground', 'rock'],
    strengths: ['grass', 'ice', 'bug', 'steel'],
  },
  water: {
    weaknesses: ['electric', 'grass'],
    strengths: ['fire', 'ground', 'rock'],
  },
  electric: { weaknesses: ['ground'], strengths: ['water', 'flying'] },
  grass: {
    weaknesses: ['fire', 'ice', 'poison', 'flying', 'bug'],
    strengths: ['water', 'ground', 'rock'],
  },
  ice: {
    weaknesses: ['fire', 'fighting', 'rock', 'steel'],
    strengths: ['grass', 'ground', 'flying', 'dragon'],
  },
  fighting: {
    weaknesses: ['flying', 'psychic', 'fairy'],
    strengths: ['normal', 'ice', 'rock', 'dark', 'steel'],
  },
  poison: { weaknesses: ['ground', 'psychic'], strengths: ['grass', 'fairy'] },
  ground: {
    weaknesses: ['water', 'grass', 'ice'],
    strengths: ['fire', 'electric', 'poison', 'rock', 'steel'],
  },
  flying: {
    weaknesses: ['electric', 'ice', 'rock'],
    strengths: ['grass', 'fighting', 'bug'],
  },
  psychic: {
    weaknesses: ['bug', 'ghost', 'dark'],
    strengths: ['fighting', 'poison'],
  },
  bug: {
    weaknesses: ['fire', 'flying', 'rock'],
    strengths: ['grass', 'psychic', 'dark'],
  },
  rock: {
    weaknesses: ['water', 'grass', 'fighting', 'ground', 'steel'],
    strengths: ['fire', 'ice', 'flying', 'bug'],
  },
  ghost: { weaknesses: ['ghost', 'dark'], strengths: ['psychic', 'ghost'] },
  dragon: { weaknesses: ['ice', 'dragon', 'fairy'], strengths: ['dragon'] },
  dark: {
    weaknesses: ['fighting', 'bug', 'fairy'],
    strengths: ['psychic', 'ghost'],
  },
  steel: {
    weaknesses: ['fire', 'fighting', 'ground'],
    strengths: ['ice', 'rock', 'fairy'],
  },
  fairy: {
    weaknesses: ['poison', 'steel'],
    strengths: ['fighting', 'dragon', 'dark'],
  },
};

const PokemonDetailPage = () => {
  const { id } = useParams();
  const pokemonId = Array.isArray(id) ? id[0] : id;
  const [selectedGen, setSelectedGen] = useState<string>('red');

  const {
    data: pokemon,
    isLoading: isPokemonLoading,
    error: pokemonError,
  } = useQuery<PokemonDetails>(['pokemonDetails', pokemonId], () =>
    fetchPokemonDetails(pokemonId)
  );

  const {
    data: species,
    isLoading: isSpeciesLoading,
    error: speciesError,
  } = useQuery<PokemonSpecies>(['pokemonSpecies', pokemonId], () =>
    fetchPokemonSpecies(pokemonId)
  );

  const {
    data: evolutionChain,
    isLoading: isEvolutionLoading,
    error: evolutionError,
  } = useQuery<EvolutionChain>(
    ['evolutionChain', species?.evolution_chain?.url],
    () =>
      species?.evolution_chain?.url
        ? fetchEvolutionChain(species.evolution_chain.url)
        : Promise.resolve({
            chain: { species: { name: 'Unknown', url: '' }, evolves_to: [] },
          }),
    { enabled: !!species?.evolution_chain?.url }
  );

  const mainAbility = pokemon?.abilities.find((a) => !a.is_hidden)?.ability;

  const { data: abilityDetails, isLoading: isAbilityLoading } =
    useQuery<AbilityDetails>(
      ['abilityDetails', mainAbility?.name],
      () =>
        mainAbility
          ? fetchAbilityDetails(mainAbility.name)
          : Promise.resolve({ effect_entries: [] }),
      { enabled: !!mainAbility }
    );

  useEffect(() => {
    if (species) {
      const hasRedVersion = species.flavor_text_entries.some(
        (entry) => entry.version.name === 'red'
      );
      setSelectedGen(hasRedVersion ? 'red' : 'latest');
    }
  }, [species]);

  const calculateTypeEffectiveness = (types: string[]) => {
    let weaknesses = new Set<string>();
    let strengths = new Set<string>();

    types.forEach((type) => {
      (
        typeEffectiveness as {
          [key: string]: { weaknesses: string[]; strengths: string[] };
        }
      )[type.toLowerCase()]?.weaknesses.forEach((w) => weaknesses.add(w));
      (
        typeEffectiveness as {
          [key: string]: { weaknesses: string[]; strengths: string[] };
        }
      )[type.toLowerCase()]?.strengths.forEach((s) => strengths.add(s));
    });

    // Remove types that appear in both weaknesses and strengths
    const finalWeaknesses = Array.from(weaknesses).filter(
      (w) => !strengths.has(w)
    );
    const finalStrengths = Array.from(strengths).filter(
      (s) => !weaknesses.has(s)
    );

    return { weaknesses: finalWeaknesses, strengths: finalStrengths };
  };

  if (isPokemonLoading || isSpeciesLoading)
    return <div className="text-center mt-8">Loading...</div>;
  if (pokemonError || speciesError)
    return (
      <div className="text-center mt-8 text-red-500">
        Error loading Pokémon details
      </div>
    );
  if (!pokemon || !species) return null;

  const getDescription = () => {
    if (!species.flavor_text_entries.length) return 'No description available.';

    if (selectedGen === 'latest') {
      return species.flavor_text_entries[species.flavor_text_entries.length - 1]
        .flavor_text;
    }

    const genDescription = species.flavor_text_entries.find(
      (entry) => entry.version.name === selectedGen
    );
    return genDescription
      ? genDescription.flavor_text
      : 'No description available for this generation.';
  };

  const availableGens = Array.from(
    new Set(species.flavor_text_entries.map((entry) => entry.version.name))
  );

  const getAbilityDescription = () => {
    if (isAbilityLoading) return 'Loading ability description...';
    if (!abilityDetails) return 'No ability description available.';
    return (
      abilityDetails.effect_entries.find(
        (entry) => entry.language.name === 'en'
      )?.short_effect || 'No English description available.'
    );
  };

  if (!pokemon || !species) return null;

  const { weaknesses, strengths } = calculateTypeEffectiveness(
    pokemon.types.map((t) => t.type.name)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/pokedex"
        className="inline-flex items-center mb-6 text-blue-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeftCircle className="mr-2" />
        Back to Pokédex
      </Link>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Left side - Pokemon Image and Stats */}
            <div className="w-full md:w-1/3 bg-gray-100 dark:bg-gray-800 flex flex-col items-center p-8">
              <Image
                src={
                  pokemon.sprites.other['official-artwork'].front_default ||
                  pokemon.sprites.front_default
                }
                alt={pokemon.name}
                width={300}
                height={300}
                className="object-contain mb-8"
              />

              {/* Stats Section */}
              <div className="w-full">
                <h3 className="text-xl font-semibold mb-4">Stats</h3>
                <div className="space-y-2">
                  {pokemon.stats.map((stat) => (
                    <div key={stat.stat.name}>
                      <div className="flex justify-between">
                        <span className="capitalize">{stat.stat.name}</span>
                        <span>{stat.base_stat}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${(stat.base_stat / 255) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side - Pokemon Details */}
            <div className="w-full md:w-2/3 p-6">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold capitalize">
                  {pokemon.name}
                </h1>
                <span className="text-2xl font-semibold text-gray-500">
                  #{pokemon.id.toString().padStart(3, '0')}
                </span>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Description</h3>
                  <Select value={selectedGen} onValueChange={setSelectedGen}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select generation" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableGens.includes('red') && (
                        <SelectItem value="red">Red</SelectItem>
                      )}
                      <SelectItem value="latest">Latest</SelectItem>
                      {availableGens
                        .filter((gen) => gen !== 'red')
                        .map((gen) => (
                          <SelectItem key={gen} value={gen}>
                            {gen}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {getDescription()}
                </p>
              </div>

              {/* Key Attributes Section */}
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6">
                <h3 className="text-xl font-semibold mb-4">Key Attributes</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Ruler className="w-6 h-6 mr-2 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Height
                      </p>
                      <p className="font-semibold">{pokemon.height / 10} m</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Weight className="w-6 h-6 mr-2 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Weight
                      </p>
                      <p className="font-semibold">{pokemon.weight / 10} kg</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Zap className="w-6 h-6 mr-2 text-yellow-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Main Ability
                      </p>
                      <Tooltip.Provider>
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <p className="font-semibold capitalize cursor-help">
                              {mainAbility?.name || 'Unknown'}
                            </p>
                          </Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Content
                              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded shadow-lg max-w-xs"
                              sideOffset={5}
                            >
                              {getAbilityDescription()}
                              <Tooltip.Arrow className="fill-current text-white dark:text-gray-800" />
                            </Tooltip.Content>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                      </Tooltip.Provider>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-6 h-6 mr-2 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Base Experience
                      </p>
                      <p className="font-semibold">{pokemon.base_experience}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Type Effectiveness Section */}
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6">
                <h3 className="text-xl font-semibold mb-4">
                  Type Effectiveness
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Type</h4>
                    <div className="flex flex-wrap gap-2">
                      {pokemon.types.map((type) => (
                        <Badge
                          key={type.type.name}
                          className={`${typeColors[type.type.name]} text-white`}
                        >
                          {type.type.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Weaknesses</h4>
                    <div className="flex flex-wrap gap-2">
                      {weaknesses.map((type) => (
                        <Badge
                          key={type}
                          className={`${typeColors[type]} text-white`}
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Strong Against</h4>
                    <div className="flex flex-wrap gap-2">
                      {strengths.map((type) => (
                        <Badge
                          key={type}
                          className={`${typeColors[type]} text-white`}
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evolution Chain */}
      {!isEvolutionLoading && evolutionChain && (
        <Card className="overflow-hidden shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4 text-center font-pixel text-gray-800 dark:text-gray-200">
              Evolution Chain
            </h2>
            <EvolutionChainComponent chain={evolutionChain} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PokemonDetailPage;
