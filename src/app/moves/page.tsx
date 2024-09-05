'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { ChevronUp } from 'lucide-react';
import { useQuery } from 'react-query';
import { useDebounce } from 'use-debounce';

import LoadingSpinner from '@/components/loading-spinner';
import MovesFilter from '@/components/moves-filter';
import MovesList from '@/components/moves-list';
import PaginationControls from '@/components/pagination-controls';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { fetchMoves } from '@/lib/api';
import { MoveDetails } from '@/lib/types';

const ITEMS_PER_PAGE = 20;

const MovesPage: React.FC = () => {
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    searchTerm: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { data, isLoading, error, refetch } = useQuery(
    ['moves', filters, currentPage],
    () =>
      fetchMoves(
        currentPage,
        ITEMS_PER_PAGE,
        filters.type,
        filters.category,
        filters.searchTerm
      ),
    {
      keepPreviousData: true,
    }
  );

  const [debouncedRefetch] = useDebounce(
    useCallback(() => {
      setCurrentPage(1);
      refetch();
    }, [refetch]),
    300
  );

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    debouncedRefetch();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    scrollToTop();
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

  if (isLoading) {
    return <LoadingSpinner size="lg" message="Loading moves data..." />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error instanceof Error
            ? error.message
            : 'An error occurred while loading moves data.'}
          <Button onClick={() => refetch()} className="mt-2">
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const totalPages = data ? Math.ceil(data.totalCount / ITEMS_PER_PAGE) : 0;

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Pokémon Moves Database
      </h1>
      <MovesFilter filters={filters} setFilters={handleFilterChange} />
      {data && data.moves.length > 0 ? (
        <>
          <MovesList moves={data.moves} />
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
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
