import React from 'react';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface LegendaryPokemon {
  id: number;
  name: string;
  type: string[];
  description: string;
  lore: string;
  howToObtain: string;
  imageUrl: string;
}

const legendaryPokemon: LegendaryPokemon[] = [
  {
    id: 144,
    name: 'Articuno',
    type: ['Ice', 'Flying'],
    description: 'A legendary bird Pokémon that can control ice.',
    lore: 'Articuno is said to live in cold, snowy mountains. It freezes water vapor in the air to create snow while flying.',
    howToObtain:
      "Can be found in the Seafoam Islands in most games. In some games, it's encountered during specific legendary quests.",
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/144.png',
  },
  {
    id: 150,
    name: 'Mewtwo',
    type: ['Psychic'],
    description: 'A Pokémon created by genetic manipulation.',
    lore: "Mewtwo was created from Mew's DNA, enhanced through years of horrific gene splicing and DNA engineering experiments.",
    howToObtain:
      "Usually found in Cerulean Cave after completing the main game. In some versions, it's part of special events.",
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
  },
  {
    id: 249,
    name: 'Lugia',
    type: ['Psychic', 'Flying'],
    description: 'A legendary Pokémon said to be the guardian of the seas.',
    lore: 'Lugia is said to be the guardian of the seas. It is said to have the power to calm even the most ferocious storms.',
    howToObtain:
      'Can be caught in the Whirl Islands in some games. Often part of main legendary quests in others.',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/249.png',
  },
];

const LegendaryPokemonShowcase: React.FC = () => {
  return (
    <div className="py-12 bg-gradient-to-b from-blue-900 to-indigo-900">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-white mb-8">
          Legendary Pokémon Showcase
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {legendaryPokemon.map((pokemon, index) => (
            <motion.div
              key={pokemon.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <Card className="h-full overflow-hidden bg-white/10 backdrop-blur-md border-none text-white">
                <CardHeader className="relative h-48">
                  <Image
                    src={pokemon.imageUrl}
                    alt={pokemon.name}
                    layout="fill"
                    objectFit="contain"
                    className="transform hover:scale-110 transition-transform duration-300"
                  />
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="text-2xl mb-2">
                    {pokemon.name}
                  </CardTitle>
                  <div className="mb-4">
                    {pokemon.type.map((type) => (
                      <Badge key={type} className="mr-2 mb-2 bg-blue-500">
                        {type}
                      </Badge>
                    ))}
                  </div>
                  <p className="mb-4 text-sm">{pokemon.description}</p>
                  <h4 className="font-semibold mb-2">Lore:</h4>
                  <p className="mb-4 text-sm">{pokemon.lore}</p>
                  <h4 className="font-semibold mb-2">How to Obtain:</h4>
                  <p className="text-sm">{pokemon.howToObtain}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/legendary-pokemon" passHref>
            <motion.div
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition-colors duration-300 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore More Legendary Pokémon
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LegendaryPokemonShowcase;
