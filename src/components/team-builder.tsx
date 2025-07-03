import React, { useCallback, useEffect, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle,
  Plus,
  Shuffle,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react';

import {
  containerVariants,
  itemVariants,
  scaleIn,
  staggeredFadeIn,
} from '@/lib/animation-variants';
import { PokemonDetails } from '@/lib/types';

import PokemonSelector from './pokemon-selector';
import TeamAnalysis from './team-analysis';
import TeamMember from './team-member';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

const MAX_TEAM_SIZE = 6;

// Enhanced empty slot component
const EmptySlot: React.FC<{
  index: number;
  isHighlighted?: boolean;
  onAddClick?: () => void;
}> = ({ index, isHighlighted = false, onAddClick }) => {
  return (
    <motion.div
      variants={staggeredFadeIn}
      custom={index}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onAddClick}
      className={`
        relative border-2 border-dashed rounded-lg h-32 sm:h-40
        flex flex-col items-center justify-center text-gray-400 dark:text-gray-600
        text-sm sm:text-base cursor-pointer transition-all duration-300
        hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10
        ${isHighlighted ? 'border-primary/70 bg-primary/10' : 'border-gray-300 dark:border-gray-700'}
      `}
    >
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Plus className="w-6 h-6 mb-2" />
      </motion.div>
      <span className="font-medium">Empty Slot</span>
      <span className="text-xs opacity-70 mt-1">Click to add</span>

      {/* Slot number indicator */}
      <div className="absolute top-2 right-2 w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold">
        {index + 1}
      </div>
    </motion.div>
  );
};

// Notification component
const TeamNotification: React.FC<{
  type: 'success' | 'error' | 'info';
  message: string;
  isVisible: boolean;
  onDismiss: () => void;
}> = ({ type, message, isVisible, onDismiss }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onDismiss, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onDismiss]);

  if (!isVisible) return null;

  const variants = {
    hidden: { opacity: 0, y: -50, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -50, scale: 0.9 },
  };

  const alertVariant = type === 'error' ? 'destructive' : 'default';

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={variants}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed top-4 right-4 z-50 w-80"
    >
      <Alert variant={alertVariant} className="shadow-lg border-2">
        <div className="flex items-center gap-2">
          {type === 'success' && <CheckCircle className="w-4 h-4" />}
          {type === 'error' && <AlertCircle className="w-4 h-4" />}
          {type === 'info' && <Sparkles className="w-4 h-4" />}
          <AlertDescription className="font-medium">{message}</AlertDescription>
        </div>
      </Alert>
    </motion.div>
  );
};

const TeamBuilder: React.FC = () => {
  const [team, setTeam] = useState<PokemonDetails[]>([]);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    isVisible: boolean;
  }>({ type: 'info', message: '', isVisible: false });
  const [highlightedSlot, setHighlightedSlot] = useState<number | null>(null);

  const showNotification = useCallback(
    (type: 'success' | 'error' | 'info', message: string) => {
      setNotification({ type, message, isVisible: true });
    },
    []
  );

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  }, []);

  const addToTeam = useCallback(
    (pokemon: PokemonDetails) => {
      if (team.length < MAX_TEAM_SIZE) {
        // Check if Pokemon is already in team
        if (team.some((p) => p.id === pokemon.id)) {
          showNotification('error', `${pokemon.name} is already in your team!`);
          return;
        }

        setTeam((prev) => [...prev, pokemon]);
        showNotification('success', `${pokemon.name} added to your team!`);

        // Highlight the slot that was filled
        setHighlightedSlot(team.length);
        setTimeout(() => setHighlightedSlot(null), 1000);
      } else {
        showNotification(
          'error',
          'Your team is already full! Remove a Pokémon first.'
        );
      }
    },
    [team.length, team, showNotification]
  );

  const removeFromTeam = useCallback(
    (index: number) => {
      const removedPokemon = team[index];
      setTeam((prev) => prev.filter((_, i) => i !== index));
      showNotification(
        'info',
        `${removedPokemon.name} removed from your team.`
      );
    },
    [team, showNotification]
  );

  const clearTeam = useCallback(() => {
    if (team.length === 0) {
      showNotification('info', 'Your team is already empty!');
      return;
    }
    setTeam([]);
    showNotification('info', 'Team cleared successfully!');
  }, [team.length, showNotification]);

  const randomizeTeam = useCallback(async () => {
    // This would need to be implemented with random Pokemon selection
    showNotification('info', 'Random team generation coming soon!');
  }, [showNotification]);

  const getTeamCompletionPercentage = () => {
    return (team.length / MAX_TEAM_SIZE) * 100;
  };

  const getTeamStatusColor = () => {
    const percentage = getTeamCompletionPercentage();
    if (percentage === 100) return 'text-green-600 dark:text-green-400';
    if (percentage >= 50) return 'text-blue-600 dark:text-blue-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getTeamStatusIcon = () => {
    const percentage = getTeamCompletionPercentage();
    if (percentage === 100)
      return (
        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
      );
    if (percentage >= 50)
      return (
        <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      );
    return <Target className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
  };

  return (
    <TooltipProvider>
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Notification */}
        <AnimatePresence>
          <TeamNotification
            type={notification.type}
            message={notification.message}
            isVisible={notification.isVisible}
            onDismiss={hideNotification}
          />
        </AnimatePresence>

        {/* Team Status Card */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getTeamStatusIcon()}
                  <span className={`text-lg ${getTeamStatusColor()}`}>
                    Team Progress
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={`${getTeamStatusColor()} border-current`}
                  >
                    {team.length}/{MAX_TEAM_SIZE}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <Progress
                  value={getTeamCompletionPercentage()}
                  className="h-2"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {team.length === 0 && 'Start building your team!'}
                    {team.length > 0 &&
                      team.length < MAX_TEAM_SIZE &&
                      `${MAX_TEAM_SIZE - team.length} more slots available`}
                    {team.length === MAX_TEAM_SIZE &&
                      'Team complete! Ready for battle!'}
                  </span>
                  <span className={`font-semibold ${getTeamStatusColor()}`}>
                    {Math.round(getTeamCompletionPercentage())}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    Quick Actions
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearTeam}
                        disabled={team.length === 0}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear Team
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Remove all Pokémon from your team
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={randomizeTeam}
                        className="flex items-center gap-2"
                      >
                        <Shuffle className="w-4 h-4" />
                        Random Team
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Generate a random team (coming soon)
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pokemon Selector */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-xl">Select Pokémon</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                    Choose from over 1000 Pokémon to build your perfect team
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <PokemonSelector onSelect={addToTeam} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Team Display */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-xl">Your Team</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                      {team.length === 0
                        ? 'No Pokémon selected yet'
                        : `${team.length} of ${MAX_TEAM_SIZE} slots filled`}
                    </p>
                  </div>
                </div>
                {team.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                  >
                    {team.length}/{MAX_TEAM_SIZE}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
                variants={containerVariants}
              >
                <AnimatePresence mode="popLayout">
                  {team.map((pokemon, index) => (
                    <motion.div
                      key={`${pokemon.id}-${index}`}
                      variants={scaleIn}
                      initial="hidden"
                      animate="visible"
                      exit={{
                        scale: 0,
                        opacity: 0,
                        transition: { duration: 0.2 },
                      }}
                      layout
                      whileHover={{ scale: 1.02, y: -2 }}
                      className={`
                        ${highlightedSlot === index ? 'ring-2 ring-green-500 ring-offset-2' : ''}
                      `}
                    >
                      <TeamMember
                        pokemon={pokemon}
                        onRemove={() => removeFromTeam(index)}
                      />
                    </motion.div>
                  ))}

                  {[...Array(MAX_TEAM_SIZE - team.length)].map((_, index) => (
                    <EmptySlot
                      key={`empty-${index}`}
                      index={team.length + index}
                      isHighlighted={highlightedSlot === team.length + index}
                      onAddClick={() => {
                        // Scroll to pokemon selector
                        const selector = document.querySelector(
                          '[data-pokemon-selector]'
                        );
                        selector?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Team Analysis */}
        <motion.div variants={itemVariants}>
          <TeamAnalysis team={team} />
        </motion.div>
      </motion.div>
    </TooltipProvider>
  );
};

export default TeamBuilder;
