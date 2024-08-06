import {
  EvolutionChain as EvolutionChainType,
  PokemonDetails,
} from "@/lib/types";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import Image from "next/image";
import TypeBadge from "./type-badge";
import StatBar from "./statbar";
import EvolutionChain from "./evolution-chain";

const PokemonCard: React.FC<{
  pokemon: PokemonDetails;
  evolutionChain: EvolutionChainType | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}> = ({
  pokemon,
  evolutionChain,
  isLoading,
  error,
  onRetry,
  isFavorite,
  onToggleFavorite,
}) => {
  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row">
            <Skeleton className="w-48 h-48 mx-auto md:mx-0" />
            <div className="w-full md:w-2/3 mt-4 md:mt-0 md:ml-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-2/3 mb-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
          <Button onClick={onRetry} className="mt-2">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!pokemon) return null;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl">
            {pokemon.name} (#{pokemon.id})
          </CardTitle>
          <Button onClick={onToggleFavorite} variant="outline">
            {isFavorite ? "★" : "☆"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic">
          <TabsList>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="moves">Moves</TabsTrigger>
            <TabsTrigger value="evolution">Evolution</TabsTrigger>
          </TabsList>
          <TabsContent value="basic">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/3">
                <Image
                  src={pokemon.sprites.front_default}
                  alt={pokemon.name}
                  className="w-48 h-48 mx-auto"
                  width={192}
                  height={192}
                />
              </div>
              <div className="w-full md:w-2/3">
                <p>
                  <strong>Type:</strong>{" "}
                  {pokemon.types.map((type) => (
                    <TypeBadge key={type.type.name} type={type.type.name} />
                  ))}
                </p>
                <p>
                  <strong>Height:</strong> {pokemon.height / 10}m
                </p>
                <p>
                  <strong>Weight:</strong> {pokemon.weight / 10}kg
                </p>
                <p>
                  <strong>Abilities:</strong>
                </p>
                <ul className="list-disc list-inside">
                  {pokemon.abilities.map((ability, index) => (
                    <li key={index}>
                      {ability.ability.name} {ability.is_hidden && "(Hidden)"}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="stats">
            <div className="mt-4">
              {pokemon.stats.map((stat, index) => (
                <StatBar key={index} stat={stat} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="moves">
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
              {pokemon.moves.slice(0, 20).map((move, index) => (
                <p key={index}>{move.move.name}</p>
              ))}
            </div>
            {pokemon.moves.length > 20 && (
              <p className="mt-2 text-sm text-gray-500">
                Showing first 20 moves
              </p>
            )}
          </TabsContent>
          <TabsContent value="evolution">
            {evolutionChain ? (
              <EvolutionChain chain={evolutionChain} />
            ) : (
              <p>Evolution data not available</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PokemonCard;
