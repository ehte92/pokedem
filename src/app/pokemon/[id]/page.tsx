'use client';

import React, { useEffect, useState } from 'react';

import * as Tooltip from '@radix-ui/react-tooltip';
import {
  ArrowLeft,
  ArrowLeftCircle,
  ArrowRight,
  Ruler,
  Star,
  Weight,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from 'react-query';

import EvolutionChainComponent from '@/components/evolution-chain';
import LoadingSpinner from '@/components/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  fetchPokemonList,
  fetchPokemonSpecies,
} from '@/lib/api';
import { typeColors } from '@/lib/constants';
import {
  AbilityDetails,
  EvolutionChain,
  PokemonDetails,
  PokemonListItem,
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
  const pokemonName = Array.isArray(id) ? id[0] : id;
  const [selectedGen, setSelectedGen] = useState<string>('red');
  const [prevPokemon, setPrevPokemon] = useState<PokemonListItem | null>(null);
  const [nextPokemon, setNextPokemon] = useState<PokemonListItem | null>(null);

  const { data: allPokemon } = useQuery<PokemonListItem[]>(
    'allPokemon',
    async () => {
      const response = await fetchPokemonList(0, 1000);
      return response.results;
    }
  );

  const {
    data: pokemon,
    isLoading: isPokemonLoading,
    error: pokemonError,
  } = useQuery<PokemonDetails>(['pokemonDetails', pokemonName], () =>
    fetchPokemonDetails(pokemonName)
  );

  const {
    data: species,
    isLoading: isSpeciesLoading,
    error: speciesError,
  } = useQuery<PokemonSpecies>(['pokemonSpecies', pokemonName], () =>
    fetchPokemonSpecies(pokemonName)
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

  useEffect(() => {
    if (allPokemon && pokemon) {
      const currentIndex = allPokemon.findIndex((p) => p.name === pokemon.name);
      if (currentIndex > 0) {
        setPrevPokemon(allPokemon[currentIndex - 1]);
      } else {
        setPrevPokemon(null);
      }
      if (currentIndex < allPokemon.length - 1) {
        setNextPokemon(allPokemon[currentIndex + 1]);
      } else {
        setNextPokemon(null);
      }
    }
  }, [allPokemon, pokemon]);

  if (isPokemonLoading || isSpeciesLoading || isEvolutionLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner size="lg" message="Loading Pokémon details..." />
      </div>
    );
  }

  if (pokemonError || speciesError || evolutionError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-red-500">
          Error loading Pokémon details
        </p>
      </div>
    );
  }

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
    if (!species?.flavor_text_entries.length)
      return 'No description available.';

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

  const availableGens = species
    ? Array.from(
        new Set(species.flavor_text_entries.map((entry) => entry.version.name))
      )
    : [];

  const getAbilityDescription = () => {
    if (isAbilityLoading) return 'Loading ability description...';
    if (!abilityDetails) return 'No ability description available.';
    return (
      abilityDetails.effect_entries.find(
        (entry) => entry.language.name === 'en'
      )?.short_effect || 'No English description available.'
    );
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

  const { weaknesses, strengths } = calculateTypeEffectiveness(
    pokemon.types.map((t) => t.type.name)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <Link
          href="/pokedex"
          className="inline-flex items-center text-blue-500 hover:text-blue-600 transition-colors mb-4 sm:mb-0"
        >
          <ArrowLeftCircle className="mr-2" />
          Back to Pokédex
        </Link>
        <div className="flex space-x-2 sm:space-x-4">
          {prevPokemon && (
            <Link href={`/pokemon/${prevPokemon.name}`}>
              <Button
                variant="outline"
                className="flex items-center text-sm sm:text-base"
              >
                <ArrowLeft className="mr-1 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                {prevPokemon.name}
              </Button>
            </Link>
          )}
          {nextPokemon && (
            <Link href={`/pokemon/${nextPokemon.name}`}>
              <Button
                variant="outline"
                className="flex items-center text-sm sm:text-base"
              >
                {nextPokemon.name}
                <ArrowRight className="ml-1 sm:ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Left side - Pokemon Image and Stats */}
            <div className="w-full md:w-1/3 bg-gray-100 dark:bg-gray-800 flex flex-col items-center p-4 sm:p-8">
              <Image
                src={
                  pokemon.sprites.other['official-artwork'].front_default ||
                  pokemon.sprites.front_default
                }
                alt={pokemon.name}
                width={250}
                height={250}
                className="object-contain mb-4 sm:mb-8"
              />

              {/* Stats Section */}
              <div className="w-full">
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">
                  Stats
                </h3>
                <div className="space-y-2">
                  {pokemon.stats.map((stat) => (
                    <div key={stat.stat.name}>
                      <div className="flex justify-between">
                        <span className="capitalize text-sm">
                          {stat.stat.name}
                        </span>
                        <span className="text-sm">{stat.base_stat}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(stat.base_stat / 255) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side - Pokemon Details */}
            <div className="w-full md:w-2/3 p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl sm:text-3xl font-bold capitalize">
                  {pokemon.name}
                </h1>
                <span className="text-xl sm:text-2xl font-semibold text-gray-500">
                  #{pokemon.id.toString().padStart(3, '0')}
                </span>
              </div>

              <div className="mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                  <h3 className="text-lg font-semibold mb-2 sm:mb-0">
                    Description
                  </h3>
                  <Select value={selectedGen} onValueChange={setSelectedGen}>
                    <SelectTrigger className="w-full sm:w-[180px]">
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
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  {getDescription()}
                </p>
              </div>

              {/* Key Attributes Section */}
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                  Key Attributes
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center">
                    <Ruler className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-500" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Height
                      </p>
                      <p className="text-sm sm:text-base font-semibold">
                        {pokemon.height / 10} m
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Weight className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-green-500" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Weight
                      </p>
                      <p className="text-sm sm:text-base font-semibold">
                        {pokemon.weight / 10} kg
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-yellow-500" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Main Ability
                      </p>
                      <Tooltip.Provider>
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <p className="text-sm sm:text-base font-semibold capitalize cursor-help">
                              {mainAbility?.name || 'Unknown'}
                            </p>
                          </Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Content
                              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded shadow-lg max-w-xs text-xs sm:text-sm"
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
                    <Star className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-purple-500" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Base Experience
                      </p>
                      <p className="text-sm sm:text-base font-semibold">
                        {pokemon.base_experience}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Type Effectiveness Section */}
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                  Type Effectiveness
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-sm sm:text-base">
                      Type
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {pokemon.types.map((type) => (
                        <Badge
                          key={type.type.name}
                          className={`${typeColors[type.type.name]} text-white text-xs sm:text-sm`}
                        >
                          {type.type.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm sm:text-base">
                      Weaknesses
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {weaknesses.map((type) => (
                        <Badge
                          key={type}
                          className={`${typeColors[type]} text-white text-xs sm:text-sm`}
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm sm:text-base">
                      Strong Against
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {strengths.map((type) => (
                        <Badge
                          key={type}
                          className={`${typeColors[type]} text-white text-xs sm:text-sm`}
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
        <Card className="overflow-hidden shadow-lg mt-6">
          <CardContent className="p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center font-pixel text-gray-800 dark:text-gray-200">
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
