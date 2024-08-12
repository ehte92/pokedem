import React, { useCallback, useMemo, useState } from 'react';

import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { useInfiniteQuery, useQuery } from 'react-query';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchPokemonByType, fetchPokemonList, searchPokemon } from '@/lib/api';
import { POKEMON_TYPES } from '@/lib/constants';
import { PokemonListItem, PokemonListResponse } from '@/lib/types';

import ErrorComponent from './error';
import LoadingIndicator from './loading-indicator';
import PokemonListCard from './pokemon-list-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const ITEMS_PER_PAGE = 20;

const Pokedex: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isSearching, setIsSearching] = useState(false);

  const {
    data: pokemonListData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status: listStatus,
  } = useInfiniteQuery<PokemonListResponse>(
    ['pokemonList', filterType],
    ({ pageParam = 0 }) => fetchPokemonList(pageParam, ITEMS_PER_PAGE),
    {
      getNextPageParam: (lastPage, pages) => {
        const nextOffset = pages.length * ITEMS_PER_PAGE;
        return nextOffset < lastPage.count ? nextOffset : undefined;
      },
      enabled: filterType === 'all',
    }
  );

  const {
    data: pokemonByType,
    fetchNextPage: fetchNextTypePage,
    hasNextPage: hasNextTypePage,
    isFetchingNextPage: isFetchingNextTypePage,
    status: typeStatus,
  } = useInfiniteQuery<PokemonListItem[]>(
    ['pokemonByType', filterType],
    ({ pageParam = 0 }) =>
      fetchPokemonByType(filterType, pageParam, ITEMS_PER_PAGE),
    {
      getNextPageParam: (lastPage, pages) => {
        return lastPage.length === ITEMS_PER_PAGE ? pages.length : undefined;
      },
      enabled: filterType !== 'all',
    }
  );

  const {
    data: searchResults,
    status: searchStatus,
    refetch: refetchSearch,
  } = useQuery<PokemonListItem[]>(
    ['pokemonSearch', searchTerm],
    () => searchPokemon(searchTerm),
    {
      enabled: false,
      onSuccess: () => setIsSearching(true),
      onError: () => setIsSearching(false),
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

  const handleTypeChange = useCallback((newType: string) => {
    setFilterType(newType);
    setIsSearching(false);
    setSearchTerm('');
  }, []);

  const displayedPokemon = useMemo(() => {
    if (isSearching && searchResults) {
      return searchResults;
    }
    if (filterType !== 'all' && pokemonByType) {
      return pokemonByType.pages.flat();
    }
    return pokemonListData
      ? pokemonListData.pages.flatMap((page) => page.results)
      : [];
  }, [isSearching, searchResults, filterType, pokemonByType, pokemonListData]);

  const loadMore = useCallback(() => {
    if (filterType === 'all') {
      fetchNextPage();
    } else {
      fetchNextTypePage();
    }
  }, [filterType, fetchNextPage, fetchNextTypePage]);

  if (listStatus === 'error')
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
        </form>
      </div>

      {listStatus === 'loading' ||
      searchStatus === 'loading' ||
      typeStatus === 'loading' ? (
        <LoadingIndicator />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {displayedPokemon.map((pokemon) => (
              <Link href={`/pokemon/${pokemon.name}`} key={pokemon.name}>
                <PokemonListCard pokemon={pokemon} />
              </Link>
            ))}
          </div>
          {!isSearching &&
            (filterType === 'all' ? hasNextPage : hasNextTypePage) && (
              <div className="mt-8 flex justify-center">
                <Button
                  onClick={loadMore}
                  disabled={isFetchingNextPage || isFetchingNextTypePage}
                  className="pixel-text bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  {isFetchingNextPage || isFetchingNextTypePage
                    ? 'Loading...'
                    : 'Load More'}
                </Button>
              </div>
            )}
        </>
      )}
    </motion.div>
  );
};

export default Pokedex;
