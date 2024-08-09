import React, { useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useQuery, useQueryClient } from "react-query";
import PokemonCard from "./pokemon-card";
import {
  PokemonListItem,
  PokemonDetails,
  EvolutionChain,
  PokemonListResponse,
} from "@/lib/types";
import { POKEMON_TYPES, POKEMON_ABILITIES } from "@/lib/constants";
import ErrorComponent from "./error";
import LoadingIndicator from "./loading-indicator";
import {
  fetchEvolutionChain,
  fetchPokemonDetails,
  fetchPokemonList,
  searchPokemon,
  fetchPokemonByType,
} from "@/lib/api";
import PokemonListCard from "./pokemon-list-card";
import { Search } from "lucide-react";

const ITEMS_PER_PAGE = 20;

const Pokedex: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedPokemon, setSelectedPokemon] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterAbility, setFilterAbility] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);

  const queryClient = useQueryClient();

  const {
    data: pokemonListData,
    status: listStatus,
    isPreviousData,
  } = useQuery<PokemonListResponse>(
    ["pokemonList", currentPage],
    () => fetchPokemonList(currentPage, ITEMS_PER_PAGE),
    { keepPreviousData: true }
  );

  const { data: pokemonByType, status: typeStatus } = useQuery<
    PokemonListItem[]
  >(["pokemonByType", filterType], () => fetchPokemonByType(filterType), {
    enabled: filterType !== "all",
  });

  const {
    data: searchResults,
    status: searchStatus,
    refetch: refetchSearch,
  } = useQuery<PokemonListItem[]>(
    ["pokemonSearch", searchTerm],
    () => searchPokemon(searchTerm),
    {
      enabled: false,
      onSuccess: () => setIsSearching(true),
      onError: () => setIsSearching(false),
    }
  );

  const { data: pokemonDetails, status: detailStatus } =
    useQuery<PokemonDetails>(
      ["pokemonDetails", selectedPokemon],
      () => fetchPokemonDetails(selectedPokemon!),
      {
        enabled: !!selectedPokemon,
      }
    );

  const { data: evolutionChain, status: evolutionStatus } =
    useQuery<EvolutionChain | null>(
      ["evolutionChain", pokemonDetails?.id],
      () => fetchEvolutionChain(pokemonDetails!.id),
      {
        enabled: !!pokemonDetails?.id,
      }
    );

  const handleSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSearchTerm(value);
    },
    []
  );

  const handleSearchSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (searchTerm.length >= 2) {
        refetchSearch();
      }
    },
    [searchTerm, refetchSearch]
  );

  const toggleFavorite = useCallback((pokemonId: number) => {
    setFavorites((prev) =>
      prev.includes(pokemonId)
        ? prev.filter((id) => id !== pokemonId)
        : [...prev, pokemonId]
    );
  }, []);

  const handleTypeChange = useCallback((newType: string) => {
    setFilterType(newType);
    setCurrentPage(1);
    setIsSearching(false);
    setSearchTerm("");
  }, []);

  const displayedPokemon = useMemo(() => {
    if (isSearching && searchResults) {
      return searchResults;
    }
    if (filterType !== "all" && pokemonByType) {
      return pokemonByType;
    }
    return pokemonListData?.results || [];
  }, [isSearching, searchResults, filterType, pokemonByType, pokemonListData]);

  const totalPages = useMemo(() => {
    if (!pokemonListData) return 0;
    return Math.ceil(pokemonListData.count / ITEMS_PER_PAGE);
  }, [pokemonListData]);

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () => setCurrentPage((old) => Math.max(old - 1, 1));
  const goToNextPage = () => {
    if (!isPreviousData && currentPage < totalPages) {
      setCurrentPage((old) => old + 1);
    }
  };

  if (listStatus === "error")
    return <ErrorComponent message="Failed to fetch Pokemon list" />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto p-4 font-pixel bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors duration-300"
    >
      <h1 className="text-4xl font-bold mb-8 text-center text-blue-600 dark:text-blue-400 pixel-text uppercase drop-shadow-md">
        Pokédex
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 shadow-lg">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-wrap gap-4 mb-4"
        >
          <div className="flex-grow flex items-center">
            <Input
              type="text"
              placeholder="Search Pokémon"
              value={searchTerm}
              onChange={handleSearch}
              className="flex-grow pixel-text bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-l-md text-gray-800 dark:text-gray-200"
            />
            <Button
              type="submit"
              className="pixel-text bg-blue-500 hover:bg-blue-600 text-white rounded-r-md ml-2"
            >
              <Search size={20} />
            </Button>
          </div>
          <Select value={filterType} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-[180px] pixel-text bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {POKEMON_TYPES.map((type) => (
                <SelectItem key={type} value={type.toLowerCase()}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterAbility} onValueChange={setFilterAbility}>
            <SelectTrigger className="w-[180px] pixel-text bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200">
              <SelectValue placeholder="Filter by Ability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Abilities</SelectItem>
              {POKEMON_ABILITIES.map((ability) => (
                <SelectItem key={ability} value={ability.toLowerCase()}>
                  {ability}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </form>
      </div>

      {listStatus === "loading" ||
      searchStatus === "loading" ||
      typeStatus === "loading" ? (
        <LoadingIndicator />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {displayedPokemon.map((pokemon) => (
              <PokemonListCard
                key={pokemon.name}
                pokemon={pokemon}
                onClick={() => setSelectedPokemon(pokemon.name)}
              />
            ))}
          </div>
          {!isSearching && filterType === "all" && (
            <div className="mt-8 flex flex-wrap justify-center items-center gap-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
              <Button
                onClick={goToFirstPage}
                disabled={currentPage === 1}
                className="pixel-text bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                First
              </Button>
              <Button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="pixel-text bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Previous
              </Button>
              <span className="pixel-text text-lg text-gray-800 dark:text-gray-200">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={goToNextPage}
                disabled={isPreviousData || currentPage === totalPages}
                className="pixel-text bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Next
              </Button>
              <Button
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
                className="pixel-text bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Last
              </Button>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {selectedPokemon && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            {detailStatus === "loading" ? (
              <LoadingIndicator message="Loading Pokemon details..." />
            ) : detailStatus === "error" ? (
              <ErrorComponent
                message="Error fetching Pokemon details"
                onRetry={() =>
                  queryClient.invalidateQueries([
                    "pokemonDetails",
                    selectedPokemon,
                  ])
                }
              />
            ) : pokemonDetails ? (
              <PokemonCard
                pokemon={pokemonDetails}
                evolutionChain={evolutionChain ?? null}
                isLoading={evolutionStatus === "loading"}
                error={
                  evolutionStatus === "error"
                    ? "Error fetching evolution chain"
                    : null
                }
                onRetry={() =>
                  queryClient.invalidateQueries([
                    "evolutionChain",
                    pokemonDetails.id,
                  ])
                }
                isFavorite={favorites.includes(pokemonDetails.id)}
                onToggleFavorite={() => toggleFavorite(pokemonDetails.id)}
              />
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Pokedex;
