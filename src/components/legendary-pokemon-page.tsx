'use client';

import React, { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import LoadingSpinner from '@/components/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useEvolutionChain,
  usePokemonSpecies,
} from '@/hooks/pokemon-detail-hooks';
import { useLegendaryPokemon } from '@/hooks/use-legendary-pokemon';
import { modalVariants, tabContentVariants } from '@/lib/animation-variants';
import { EvolutionChain, EvolutionTo, PokemonDetails } from '@/lib/types';

import SkeletonLoader from './skeleton-loader';

const LegendaryPokemonPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(
    null
  );
  const [activeTab, setActiveTab] = useState('overview');

  const {
    data: legendaryPokemon,
    isLoading,
    error,
    refetch: refetchLegendaryPokemon,
  } = useLegendaryPokemon();

  const {
    data: selectedPokemonSpecies,
    error: speciesError,
    isLoading: isLoadingSpecies,
  } = usePokemonSpecies(selectedPokemonId || 0);

  const {
    data: evolutionChain,
    error: evolutionError,
    isLoading: isLoadingEvolution,
  } = useEvolutionChain(selectedPokemonSpecies?.evolution_chain?.url || '');

  const filteredPokemon =
    legendaryPokemon?.filter(
      (pokemon) =>
        pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pokemon.types.some((type) =>
          type.type.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
    ) || [];

  const handlePokemonSelect = (pokemon: PokemonDetails) => {
    setSelectedPokemonId(pokemon.id);
    setActiveTab('overview');
  };

  const renderEvolutionChain = (chain: EvolutionChain['chain']) => {
    const renderEvolutionStep = (step: EvolutionTo) => (
      <div key={step.species.name} className="flex flex-col items-center">
        <Image
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${step.species.url.split('/').slice(-2, -1)[0]}.png`}
          alt={step.species.name}
          width={96}
          height={96}
        />
        <p className="capitalize">{step.species.name}</p>
        {step.evolution_details[0] && (
          <p className="text-sm text-gray-500">
            (Level {step.evolution_details[0].min_level})
          </p>
        )}
        {step.evolves_to.length > 0 && (
          <div className="mt-4">
            <div className="text-center mb-2">↓</div>
            {step.evolves_to.map(renderEvolutionStep)}
          </div>
        )}
      </div>
    );

    return (
      <div className="flex flex-col items-center">
        {renderEvolutionStep(chain)}
      </div>
    );
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" message="Loading legendary Pokémon..." />;
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-500 mb-4">{error.message}</p>
        <Button onClick={() => refetchLegendaryPokemon()}>
          <RefreshCw className="mr-2 h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  const selectedPokemon =
    legendaryPokemon?.find((p) => p.id === selectedPokemonId) || null;
  const isLoadingModalData = isLoadingSpecies || isLoadingEvolution;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/"
        className="flex items-center text-blue-500 hover:text-blue-600 mb-6"
      >
        <ArrowLeft className="mr-2" />
        Back to Home
      </Link>

      <h1 className="text-4xl font-bold mb-8 text-center">Legendary Pokémon</h1>

      <Input
        type="text"
        placeholder="Search by name or type..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-8"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {filteredPokemon.map((pokemon) => (
            <motion.div
              key={pokemon.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card
                className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => handlePokemonSelect(pokemon)}
              >
                <CardHeader className="relative h-48">
                  <Image
                    src={
                      pokemon.sprites.other?.['official-artwork']
                        .front_default || pokemon.sprites.front_default
                    }
                    alt={pokemon.name}
                    layout="fill"
                    objectFit="contain"
                    className="transform hover:scale-110 transition-transform duration-300"
                  />
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="text-2xl mb-2 capitalize">
                    {pokemon.name}
                  </CardTitle>
                  <div className="mb-4">
                    {pokemon.types.map((type) => (
                      <Badge
                        key={type.type.name}
                        className="mr-2 mb-2 capitalize"
                      >
                        {type.type.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedPokemon && (
          <Dialog
            open={!!selectedPokemon}
            onOpenChange={() => setSelectedPokemonId(null)}
          >
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold capitalize">
                    {selectedPokemon.name}
                  </DialogTitle>
                  <DialogDescription>
                    Legendary Pokémon Details
                  </DialogDescription>
                </DialogHeader>
                {isLoadingModalData ? (
                  <SkeletonLoader />
                ) : (
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="mt-6"
                  >
                    <TabsList>
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="stats">Stats</TabsTrigger>
                      <TabsTrigger value="evolution">Evolution</TabsTrigger>
                      <TabsTrigger value="moves">Moves</TabsTrigger>
                    </TabsList>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        variants={tabContentVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <TabsContent value="overview">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <Image
                                src={
                                  selectedPokemon.sprites.other?.[
                                    'official-artwork'
                                  ].front_default ||
                                  selectedPokemon.sprites.front_default
                                }
                                alt={selectedPokemon.name}
                                width={300}
                                height={300}
                                objectFit="contain"
                              />
                              <div className="mt-4">
                                <h4 className="font-semibold mb-2">Type:</h4>
                                {selectedPokemon.types.map((type) => (
                                  <Badge
                                    key={type.type.name}
                                    className="mr-2 mb-2 capitalize"
                                  >
                                    {type.type.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p>
                                <strong>Height:</strong>{' '}
                                {selectedPokemon.height / 10} m
                              </p>
                              <p>
                                <strong>Weight:</strong>{' '}
                                {selectedPokemon.weight / 10} kg
                              </p>
                              <p>
                                <strong>Abilities:</strong>{' '}
                                {selectedPokemon.abilities
                                  .map((a) => a.ability.name)
                                  .join(', ')}
                              </p>
                              {speciesError ? (
                                <p className="text-red-500">
                                  Failed to load species data.
                                </p>
                              ) : (
                                selectedPokemonSpecies && (
                                  <>
                                    <h4 className="font-semibold mt-4 mb-2">
                                      Pokédex Entry:
                                    </h4>
                                    <p className="text-sm mb-4">
                                      {
                                        selectedPokemonSpecies.flavor_text_entries.find(
                                          (entry) =>
                                            entry.language.name === 'en'
                                        )?.flavor_text
                                      }
                                    </p>
                                    <p>
                                      <strong>Habitat:</strong>{' '}
                                      {selectedPokemonSpecies.habitat?.name ||
                                        'Unknown'}
                                    </p>
                                    <p>
                                      <strong>Generation:</strong>{' '}
                                      {selectedPokemonSpecies.generation.name}
                                    </p>
                                  </>
                                )
                              )}
                            </div>
                          </div>
                        </TabsContent>
                        <TabsContent value="stats">
                          <h4 className="font-semibold mb-4">Base Stats:</h4>
                          {selectedPokemon.stats.map((stat) => (
                            <div key={stat.stat.name} className="mb-4">
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium capitalize">
                                  {stat.stat.name}
                                </span>
                                <span className="text-sm font-medium">
                                  {stat.base_stat}
                                </span>
                              </div>
                              <Progress
                                value={stat.base_stat}
                                max={255}
                                className="h-2"
                              />
                            </div>
                          ))}
                        </TabsContent>
                        <TabsContent value="evolution">
                          {evolutionError ? (
                            <p className="text-red-500">
                              Failed to load evolution data. Please try again
                              later.
                            </p>
                          ) : evolutionChain ? (
                            <div className="mt-4">
                              <h4 className="font-semibold mb-4">
                                Evolution Chain:
                              </h4>
                              {renderEvolutionChain(evolutionChain.chain)}
                            </div>
                          ) : (
                            <p>No evolution data available for this Pokémon.</p>
                          )}
                        </TabsContent>
                        <TabsContent value="moves">
                          <h4 className="font-semibold mb-4">Moves:</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {selectedPokemon.moves.slice(0, 20).map((move) => (
                              <Badge
                                key={move.move.name}
                                variant="secondary"
                                className="capitalize"
                              >
                                {move.move.name.replace('-', ' ')}
                              </Badge>
                            ))}
                          </div>
                          {selectedPokemon.moves.length > 20 && (
                            <p className="mt-4 text-sm text-gray-500">
                              Showing first 20 moves. This Pokémon can learn{' '}
                              {selectedPokemon.moves.length} moves in total.
                            </p>
                          )}
                        </TabsContent>
                      </motion.div>
                    </AnimatePresence>
                  </Tabs>
                )}
                <div className="mt-6 text-sm text-gray-500">
                  <a
                    href={`https://bulbapedia.bulbagarden.net/wiki/${selectedPokemon.name}_(Pok%C3%A9mon)`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:text-blue-500"
                  >
                    Learn more on Bulbapedia{' '}
                    <ExternalLink size={16} className="ml-1" />
                  </a>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LegendaryPokemonPage;
