'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ChevronUp, Keyboard } from 'lucide-react';
import { useDebounce } from 'use-debounce';

import LoadingSpinner from '@/components/loading-spinner';
import MovesFilter from '@/components/moves-filter';
import MovesList from '@/components/moves-list';
import PaginationControls from '@/components/pagination-controls';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useCachedMoves } from '@/hooks/use-cached-moves';
import { MoveDetails } from '@/lib/types';

const MovesPage: React.FC = () => {
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    searchTerm: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [animationKey, setAnimationKey] = useState(0);

  const { allMoves, isLoading, error } = useCachedMoves();

  const [debouncedFilters] = useDebounce(filters, 300);

  const filteredMoves = useMemo(() => {
    if (!allMoves) return [];
    return allMoves.filter((move) => {
      const typeMatch =
        debouncedFilters.type === 'all' ||
        move.type.name === debouncedFilters.type;
      const categoryMatch =
        debouncedFilters.category === 'all' ||
        move.damage_class.name === debouncedFilters.category;
      const searchMatch =
        debouncedFilters.searchTerm === '' ||
        move.name
          .toLowerCase()
          .includes(debouncedFilters.searchTerm.toLowerCase());
      return typeMatch && categoryMatch && searchMatch;
    });
  }, [allMoves, debouncedFilters]);

  const paginatedMoves = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMoves.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMoves, currentPage, itemsPerPage]);

  const totalCount = filteredMoves.length;

  useEffect(() => {
    setAnimationKey((prev) => prev + 1);
    setIsLoadingMore(false);
  }, [paginatedMoves]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= Math.ceil(totalCount / itemsPerPage)) {
        setIsLoadingMore(true);
        setCurrentPage(page);
        scrollToTop();
      }
    },
    [totalCount, itemsPerPage]
  );

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return; // Don't handle key events when focus is in an input or textarea
      }

      switch (event.key) {
        case 'ArrowLeft':
          handlePageChange(currentPage - 1);
          break;
        case 'ArrowRight':
          handlePageChange(currentPage + 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, handlePageChange]);

  if (isLoading) {
    return <LoadingSpinner size="lg" message="Loading moves data..." />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          An error occurred while loading moves data: {(error as Error).message}
          <Button onClick={() => window.location.reload()} className="mt-2">
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Pokémon Moves Database
      </h1>
      <MovesFilter filters={filters} setFilters={handleFilterChange} />
      <div className="flex justify-between items-center mb-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center text-sm text-gray-500 cursor-help">
                <Keyboard className="w-4 h-4 mr-1" />
                Keyboard navigation
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Use left and right arrow keys to navigate between pages</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={handleItemsPerPageChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Items per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="20">20 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
            <SelectItem value="100">100 per page</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isLoadingMore && (
        <div className="text-center my-4">
          <LoadingSpinner size="sm" message="Loading more moves..." />
        </div>
      )}
      {paginatedMoves.length > 0 ? (
        <>
          <MovesList key={animationKey} moves={paginatedMoves} />
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isLoading={isLoadingMore}
          />
        </>
      ) : (
        <p className="text-center text-gray-500 mt-4">
          No moves found matching the current filters.
        </p>
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

export default MovesPage;
