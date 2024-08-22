import React, { useEffect, useState } from 'react';

import { ChevronUp, Filter } from 'lucide-react';
import { useInfiniteQuery } from 'react-query';
import { useDebounce } from 'use-debounce';

import { fetchPokemonByType, fetchPokemonList, searchPokemon } from '@/lib/api';
import { POKEMON_TYPES } from '@/lib/constants';
import { PokemonListItem } from '@/lib/types';

import PokemonListCard from './pokemon-list-card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const ITEMS_PER_PAGE = 20;

const Pokedex: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const fetchPokemon = async ({ pageParam = 0 }) => {
    if (debouncedSearchTerm) {
      const searchResults = await searchPokemon(debouncedSearchTerm);
      return { results: searchResults, nextCursor: null };
    } else if (selectedType) {
      const typeResults = await fetchPokemonByType(
        selectedType,
        pageParam,
        ITEMS_PER_PAGE
      );
      return { results: typeResults, nextCursor: pageParam + ITEMS_PER_PAGE };
    } else {
      const listResults = await fetchPokemonList(pageParam, ITEMS_PER_PAGE);
      return {
        results: listResults.results,
        nextCursor: listResults.next ? pageParam + ITEMS_PER_PAGE : null,
      };
    }
  };

  const { data, fetchNextPage, hasNextPage, isLoading, isError } =
    useInfiniteQuery(
      ['pokemon', debouncedSearchTerm, selectedType],
      fetchPokemon,
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 100 &&
        hasNextPage
      ) {
        fetchNextPage();
      }
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchNextPage, hasNextPage]);

  const handleTypeChange = (value: string) => {
    setSelectedType(value === 'all' ? null : value);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
        Pokédex
      </h1>

      <div className="mb-6">
        <div className="md:hidden">
          <Button
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className="w-full flex justify-between items-center bg-gray-800 text-white py-3 px-4 rounded-lg"
          >
            <span>Filter & Search</span>
            <Filter size={20} />
          </Button>
        </div>

        <div
          className={`mt-4 space-y-4 ${isFilterExpanded ? 'block' : 'hidden md:block'}`}
        >
          <Input
            type="text"
            placeholder="Search Pokémon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />

          <Select onValueChange={handleTypeChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by type" />
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
        </div>
      </div>

      {isLoading && <p className="text-center">Loading...</p>}
      {isError && (
        <p className="text-center text-red-500">Error loading Pokémon</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {data?.pages.map((page, i) => (
          <React.Fragment key={i}>
            {page.results.map((pokemon: PokemonListItem) => (
              <PokemonListCard key={pokemon.name} pokemon={pokemon} />
            ))}
          </React.Fragment>
        ))}
      </div>

      {hasNextPage && (
        <div className="mt-8 text-center">
          <Button onClick={() => fetchNextPage()} disabled={isLoading}>
            Load More
          </Button>
        </div>
      )}

      {showScrollTop && (
        <Button
          className="fixed bottom-4 right-4 w-10 h-10 rounded-full p-0 flex items-center justify-center text-white bg-blue-500 hover:bg-blue-700"
          onClick={scrollToTop}
        >
          <ChevronUp size={24} />
        </Button>
      )}
    </div>
  );
};

export default Pokedex;
