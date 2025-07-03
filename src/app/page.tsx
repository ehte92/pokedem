'use client';

import React, { useEffect } from 'react';

import { motion } from 'framer-motion';
import { ArrowRight, Dna, Sparkles, Swords, Users, Zap } from 'lucide-react';
import Link from 'next/link';

import FeaturedPokemon from '@/components/featured-pokemon';
import LegendaryPokemonShowcase from '@/components/legendary-pokemon-showcase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

// Assuming there are 898 Pokémon in total (up to Generation 8)
const TOTAL_POKEMON = 898;
const FEATURED_POKEMON_COUNT = 10;

// Some legendary/mythical Pokemon IDs for special showcase
const SPECIAL_POKEMON_IDS = [
  150, 151, 249, 250, 383, 384, 386, 483, 484, 487, 492, 493,
];

// Enhanced animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

const sparkleVariants = {
  animate: {
    scale: [0, 1, 0],
    opacity: [0, 1, 0],
    rotate: [0, 180, 360],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: 'loop' as const,
      ease: 'easeInOut',
    },
  },
};

const floatingAnimation = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Function to generate a list of random Pokémon IDs that changes daily
const getRandomPokemonIds = () => {
  const today = new Date().toDateString();
  let seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const randomIds = new Set<number>();
  const pseudoRandom = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  // Include at least 2-3 special Pokemon in the daily rotation
  const todaySpecialCount = Math.floor(pseudoRandom() * 3) + 2;
  const shuffledSpecial = SPECIAL_POKEMON_IDS.sort(() => pseudoRandom() - 0.5);

  for (let i = 0; i < todaySpecialCount && i < shuffledSpecial.length; i++) {
    randomIds.add(shuffledSpecial[i]);
  }

  while (randomIds.size < FEATURED_POKEMON_COUNT) {
    const id = Math.floor(pseudoRandom() * TOTAL_POKEMON) + 1;
    randomIds.add(id);
  }

  return Array.from(randomIds);
};

// Background sparkles component
const BackgroundSparkles: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }, (_, i) => (
        <motion.div
          key={i}
          className="absolute text-white/30 dark:text-white/20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          variants={sparkleVariants}
          animate="animate"
          initial={{ scale: 0 }}
        >
          <Sparkles size={12 + Math.random() * 16} />
        </motion.div>
      ))}
    </div>
  );
};

// Floating orbs component
const FloatingOrbs: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 4 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-gradient-to-br from-white/20 to-white/10 dark:from-white/10 dark:to-white/5 backdrop-blur-sm"
          style={{
            width: `${60 + Math.random() * 40}px`,
            height: `${60 + Math.random() * 40}px`,
            left: `${Math.random() * 90}%`,
            top: `${Math.random() * 90}%`,
          }}
          variants={floatingAnimation}
          animate="animate"
          initial={{ scale: 0 }}
        />
      ))}
    </div>
  );
};

const Home: React.FC = () => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  const randomPokemonIds = React.useMemo(() => getRandomPokemonIds(), []);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container mx-auto px-4 py-8 overflow-x-hidden">
        {/* Enhanced Hero Section */}
        <motion.section
          variants={itemVariants}
          className="relative text-center py-16 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 dark:from-red-600 dark:via-orange-600 dark:to-yellow-600 rounded-2xl mb-12 shadow-2xl overflow-hidden"
        >
          {/* Enhanced background elements */}
          <BackgroundSparkles count={12} />
          <FloatingOrbs />

          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20 dark:from-black/50 dark:via-transparent dark:to-black/30" />

          <div className="relative z-20">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-white px-4 font-pixel drop-shadow-lg">
                Welcome to PokéDem
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg sm:text-xl mb-8 text-white/95 px-4 font-pixel drop-shadow-md"
            >
              Your Ultimate Pokémon Companion
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap justify-center gap-3 mb-8 px-4"
            >
              <Badge className="bg-white/30 backdrop-blur-sm text-white border-white/40 hover:bg-white/40 transition-all duration-300 px-4 py-2 text-sm font-semibold shadow-lg">
                ✨ Enhanced Experience
              </Badge>
              <Badge className="bg-white/30 backdrop-blur-sm text-white border-white/40 hover:bg-white/40 transition-all duration-300 px-4 py-2 text-sm font-semibold shadow-lg">
                🎮 Interactive Features
              </Badge>
              <Badge className="bg-white/30 backdrop-blur-sm text-white border-white/40 hover:bg-white/40 transition-all duration-300 px-4 py-2 text-sm font-semibold shadow-lg">
                📱 Mobile Friendly
              </Badge>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Button
                asChild
                size="lg"
                className="bg-white/30 backdrop-blur-sm hover:bg-white/40 text-white border-white/40 border-2 font-pixel text-lg px-8 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <Link href="/pokedex">
                  Begin Your Journey <ArrowRight className="ml-3 w-5 h-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.section>

        {/* Enhanced Featured Pokémon Section */}
        <motion.section variants={itemVariants} className="mb-16">
          <div className="text-center mb-12">
            <motion.h2
              className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Daily Featured Pokémon
            </motion.h2>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '120px' }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 mx-auto mb-6 rounded-full"
            />

            <motion.p
              className="text-muted-foreground mb-6 text-lg max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Discover new Pokémon with our daily rotating selection featuring
              interactive cards
            </motion.p>

            <motion.div
              className="flex justify-center gap-3 flex-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Badge
                variant="outline"
                className="text-sm px-3 py-1 hover:bg-primary/10 transition-colors border-muted-foreground/30"
              >
                🎯 Interactive Cards
              </Badge>
              <Badge
                variant="outline"
                className="text-sm px-3 py-1 hover:bg-primary/10 transition-colors border-muted-foreground/30"
              >
                📊 Live Stats
              </Badge>
              <Badge
                variant="outline"
                className="text-sm px-3 py-1 hover:bg-primary/10 transition-colors border-muted-foreground/30"
              >
                ⭐ Special Effects
              </Badge>
              <Badge
                variant="outline"
                className="text-sm px-3 py-1 hover:bg-primary/10 transition-colors border-muted-foreground/30"
              >
                ❤️ Favorites
              </Badge>
            </motion.div>
          </div>

          <div className="relative py-16">
            <Carousel
              opts={{
                align: 'center',
                loop: true,
              }}
              className="w-full max-w-6xl mx-auto"
              setApi={setApi}
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {randomPokemonIds.map((id, index) => (
                  <CarouselItem
                    key={id}
                    className="pl-2 md:pl-4 sm:basis-1/2 lg:basis-1/3"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, rotateX: -15 }}
                      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                      transition={{
                        duration: 0.6,
                        delay: index * 0.1,
                        type: 'spring',
                        stiffness: 100,
                      }}
                      className={`transition-all duration-500 transform ${
                        index === current
                          ? 'scale-100 z-20 drop-shadow-2xl'
                          : 'scale-95 opacity-90 drop-shadow-lg'
                      }`}
                    >
                      <div className="p-2">
                        <FeaturedPokemon
                          pokemonId={id}
                          showStats={true}
                          enableInteractions={true}
                          enablePrefetching={true}
                          showEvolution={true}
                          className="h-auto min-h-[32rem] sm:min-h-[34rem] md:min-h-[36rem] hover:shadow-2xl transition-shadow duration-300"
                        />
                      </div>
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <CarouselPrevious className="left-2 sm:left-4 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 dark:bg-black/20 dark:hover:bg-black/30 border-white/30 dark:border-white/20 text-foreground" />
              <CarouselNext className="right-2 sm:right-4 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 dark:bg-black/20 dark:hover:bg-black/30 border-white/30 dark:border-white/20 text-foreground" />
            </Carousel>

            {/* Enhanced carousel indicators */}
            <div className="flex justify-center mt-8 gap-3">
              {Array.from({ length: count }).map((_, index) => (
                <motion.button
                  key={index}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    index === current
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 w-8 shadow-lg'
                      : 'bg-muted hover:bg-muted-foreground/30 w-3'
                  }`}
                  onClick={() => api?.scrollTo(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          </div>
        </motion.section>

        {/* Legendary Pokémon Showcase */}
        <motion.section variants={itemVariants} className="mb-16">
          <LegendaryPokemonShowcase />
        </motion.section>

        {/* Enhanced Features Section */}
        <motion.section variants={itemVariants} className="mb-16">
          <div className="text-center mb-12">
            <motion.h2
              className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 dark:from-green-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Powerful Features
            </motion.h2>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100px' }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 dark:from-green-400 dark:via-blue-400 dark:to-purple-400 mx-auto mb-6 rounded-full"
            />

            <motion.p
              className="text-muted-foreground text-lg max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Everything you need to master the world of Pokémon, from detailed
              analysis to epic battles
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[
              {
                icon: Dna,
                title: 'Comprehensive Pokédex',
                description:
                  'Explore detailed information about all Pokémon species with stunning visuals and comprehensive stats.',
                href: '/pokedex',
                color: 'from-blue-500 to-cyan-500',
                bgColor:
                  'hover:border-blue-300 hover:shadow-blue-500/20 dark:hover:border-blue-400 dark:hover:shadow-blue-400/20',
              },
              {
                icon: Users,
                title: 'Advanced Team Builder',
                description:
                  'Create your perfect team with strategic analysis, weakness coverage, and synergy recommendations.',
                href: '/team-builder',
                color: 'from-green-500 to-emerald-500',
                bgColor:
                  'hover:border-green-300 hover:shadow-green-500/20 dark:hover:border-green-400 dark:hover:shadow-green-400/20',
              },
              {
                icon: Swords,
                title: 'Realistic Battle Simulator',
                description:
                  'Experience thrilling battles with advanced AI, real mechanics, and immersive visual effects.',
                href: '/battle',
                color: 'from-red-500 to-orange-500',
                bgColor:
                  'hover:border-red-300 hover:shadow-red-500/20 dark:hover:border-red-400 dark:hover:shadow-red-400/20',
              },
              {
                icon: Zap,
                title: 'Type Calculator Pro',
                description:
                  'Master type advantages with interactive charts, damage calculations, and strategic insights.',
                href: '/type-calculator',
                color: 'from-yellow-500 to-amber-500',
                bgColor:
                  'hover:border-yellow-300 hover:shadow-yellow-500/20 dark:hover:border-yellow-400 dark:hover:shadow-yellow-400/20',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group"
              >
                <Card
                  className={`h-full overflow-hidden transition-all duration-300 border-2 shadow-lg hover:shadow-2xl ${feature.bgColor} backdrop-blur-sm bg-card/95 dark:bg-card/90`}
                >
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                      <motion.div
                        className="relative"
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <div
                          className={`p-4 rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg`}
                        >
                          <feature.icon className="w-8 h-8 text-white" />
                        </div>

                        {/* Animated ring on hover */}
                        <motion.div
                          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-20`}
                          initial={{ scale: 1 }}
                          whileHover={{ scale: 1.2 }}
                          transition={{ duration: 0.3 }}
                        />
                      </motion.div>

                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-xl sm:text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground mb-6 leading-relaxed">
                          {feature.description}
                        </p>
                        <Button
                          variant="ghost"
                          asChild
                          className="group/btn hover:bg-primary/10 transition-all duration-300"
                        >
                          <Link
                            href={feature.href}
                            className="inline-flex items-center"
                          >
                            <span className="font-semibold">
                              Explore Feature
                            </span>
                            <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Enhanced Call-to-Action Section */}
        <motion.section
          variants={itemVariants}
          className="relative text-center py-16 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-700 dark:via-purple-700 dark:to-indigo-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Enhanced background elements */}
          <BackgroundSparkles count={15} />
          <FloatingOrbs />

          {/* Animated gradient overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 dark:from-black/60 dark:via-transparent dark:to-black/30"
            animate={{
              background: [
                'linear-gradient(to top, rgba(0,0,0,0.4), transparent, rgba(0,0,0,0.2))',
                'linear-gradient(to top, rgba(0,0,0,0.3), transparent, rgba(0,0,0,0.25))',
                'linear-gradient(to top, rgba(0,0,0,0.4), transparent, rgba(0,0,0,0.2))',
              ],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          <div className="relative z-20">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 text-white px-4 font-pixel drop-shadow-lg">
                Ready to Become a Pokémon Master?
              </h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg sm:text-xl mb-8 text-white/95 px-4 max-w-3xl mx-auto leading-relaxed"
            >
              Join thousands of trainers exploring the enhanced Pokémon universe
              with cutting-edge features and immersive experiences
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-3 mb-10 px-4"
            >
              {[
                { icon: '🎨', text: 'Beautiful Design' },
                { icon: '⚡', text: 'Lightning Fast' },
                { icon: '🎯', text: 'Smart Features' },
                { icon: '📱', text: 'Mobile Ready' },
              ].map((badge, index) => (
                <motion.div
                  key={badge.text}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                >
                  <Badge className="bg-white/30 backdrop-blur-sm text-white border-white/40 hover:bg-white/40 transition-all duration-300 px-4 py-2 text-sm font-semibold shadow-lg">
                    {badge.icon} {badge.text}
                  </Badge>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Button
                asChild
                size="lg"
                className="bg-white/30 backdrop-blur-sm hover:bg-white/40 text-white border-white/40 border-2 font-pixel text-lg px-10 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <Link href="/pokedex">
                  Start Your Adventure
                  <motion.div
                    className="ml-3"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
};

export default Home;
