'use client';

import React from 'react';

import { ArrowRight, Dna, Swords, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';

import FeaturedPokemon from '@/components/featured-pokemon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Assuming there are 898 Pokémon in total (up to Generation 8)
const TOTAL_POKEMON = 898;
const FEATURED_POKEMON_COUNT = 10;

// Function to generate a list of random Pokémon IDs that changes daily
const getRandomPokemonIds = () => {
  const today = new Date().toDateString();
  let seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const randomIds = new Set<number>();
  const pseudoRandom = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  while (randomIds.size < FEATURED_POKEMON_COUNT) {
    const id = Math.floor(pseudoRandom() * TOTAL_POKEMON) + 1;
    randomIds.add(id);
  }

  return Array.from(randomIds);
};

const Home: React.FC = () => {
  const randomPokemonIds = React.useMemo(() => getRandomPokemonIds(), []);

  const settings = {
    className: 'center spotlight-carousel',
    centerMode: true,
    infinite: true,
    centerPadding: '0px',
    slidesToShow: 3,
    speed: 500,
    focusOnSelect: true,
    dots: false,
    arrows: true,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
          centerPadding: '0px',
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          centerPadding: '0px',
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerPadding: '0px',
        },
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8 overflow-x-hidden">
      {/* Hero Section */}
      <section className="text-center py-10 bg-gradient-to-r from-red-500 to-yellow-500 rounded-lg mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-white px-2 font-pixel">
          Welcome to the Ultimate Pokémon App
        </h1>
        <p className="text-sm sm:text-base mb-6 text-white px-2 font-pixel">
          Explore, battle, and become the very best Pokémon trainer!
        </p>
        <Button
          asChild
          variant="secondary"
          className="font-pixel max-w-xs mx-auto"
        >
          <Link href="/pokedex">
            Start Your Journey <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </Button>
      </section>

      {/* Featured Pokémon Section */}
      <section className="mb-12 sm:mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
          Featured Pokémon
        </h2>
        <div className="spotlight-carousel-container">
          <Slider {...settings}>
            {randomPokemonIds.map((id) => (
              <div key={id} className="px-2">
                <FeaturedPokemon pokemonId={id} />
              </div>
            ))}
          </Slider>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-12 sm:mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">
          Explore Amazing Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start">
              <Dna className="w-12 h-12 text-blue-500 mb-4 sm:mb-0 sm:mr-4" />
              <div className="text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  Comprehensive Pokédex
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
                  Access detailed information about all Pokémon species,
                  including types, abilities, and stats.
                </p>
                <Button
                  variant="link"
                  asChild
                  className="w-full sm:w-auto justify-center sm:justify-start"
                >
                  <Link href="/pokedex" className="text-blue-500">
                    Open Pokédex <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start">
              <Users className="w-12 h-12 text-green-500 mb-4 sm:mb-0 sm:mr-4" />
              <div className="text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  Team Builder
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
                  Create your dream Pokémon team and analyze its strengths and
                  weaknesses.
                </p>
                <Link
                  href="/team-builder"
                  className="text-green-500 hover:underline inline-flex items-center text-sm sm:text-base"
                >
                  Build Your Team <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start">
              <Swords className="w-12 h-12 text-red-500 mb-4 sm:mb-0 sm:mr-4" />
              <div className="text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  Battle Simulator
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
                  Test your skills in thrilling Pokémon battles against AI
                  opponents.
                </p>
                <Link
                  href="/battle"
                  className="text-red-500 hover:underline inline-flex items-center text-sm sm:text-base"
                >
                  Start a Battle <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start">
              <Zap className="w-12 h-12 text-yellow-500 mb-4 sm:mb-0 sm:mr-4" />
              <div className="text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  Type Effectiveness Calculator
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
                  Quickly determine type advantages and disadvantages for
                  strategic battling.
                </p>
                <Link
                  href="/type-calculator"
                  className="text-yellow-500 hover:underline inline-flex items-center text-sm sm:text-base"
                >
                  Calculate Types <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="text-center py-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white px-2 font-pixel">
          Ready to Start Your Pokémon Journey?
        </h2>
        <p className="text-sm sm:text-base mb-6 text-white px-2 font-pixel">
          Join thousands of trainers and begin your adventure today!
        </p>
        <Button
          variant="secondary"
          asChild
          className="font-pixel max-w-xs mx-auto"
        >
          <Link href="/pokedex">Explore the Pokédex</Link>
        </Button>
      </section>
    </div>
  );
};

export default Home;
