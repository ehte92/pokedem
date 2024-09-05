'use client';

import React, { useEffect, useState } from 'react';

import { useQuery } from 'react-query';

import LoadingSpinner from '@/components/loading-spinner';
import MovesFilter from '@/components/moves-filter';
import MovesList from '@/components/moves-list';
import PaginationControls from '@/components/pagination-controls';
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
  const [filteredMoves, setFilteredMoves] = useState<MoveDetails[]>([]);

  const { data, isLoading, error } = useQuery(
    ['moves', filters.type, filters.category, filters.searchTerm],
    () =>
      fetchMoves(1, 1000, filters.type, filters.category, filters.searchTerm),
    { keepPreviousData: true }
  );

  useEffect(() => {
    if (data) {
      setFilteredMoves(data.moves);
      setCurrentPage(1);
    }
  }, [data]);

  if (isLoading)
    return <LoadingSpinner size="lg" message="Loading moves data..." />;
  if (error)
    return (
      <div className="text-center text-red-500">Error loading moves data</div>
    );
  if (!data) return null;

  const totalPages = Math.ceil(filteredMoves.length / ITEMS_PER_PAGE);
  const paginatedMoves = filteredMoves.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Pokémon Moves Database
      </h1>
      <MovesFilter filters={filters} setFilters={setFilters} />
      <MovesList moves={paginatedMoves} />
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default MovesPage;
