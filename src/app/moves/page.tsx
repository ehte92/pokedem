'use client';

import React, { useState } from 'react';

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

  const { data, isLoading, error } = useQuery(
    ['moves', currentPage],
    () => fetchMoves(currentPage, ITEMS_PER_PAGE),
    { keepPreviousData: true }
  );

  if (isLoading)
    return <LoadingSpinner size="lg" message="Loading moves data..." />;
  if (error)
    return (
      <div className="text-center text-red-500">Error loading moves data</div>
    );
  if (!data) return null;

  const { moves, totalCount } = data;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const filteredMoves = moves.filter((move) => {
    return (
      (filters.type === 'all' || move.type.name === filters.type) &&
      (filters.category === 'all' ||
        move.damage_class.name === filters.category) &&
      (filters.searchTerm === '' ||
        move.name.toLowerCase().includes(filters.searchTerm.toLowerCase()))
    );
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Pokémon Moves Database
      </h1>
      <MovesFilter filters={filters} setFilters={setFilters} />
      <MovesList moves={filteredMoves} />
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default MovesPage;
