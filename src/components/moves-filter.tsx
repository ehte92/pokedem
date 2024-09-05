import React from 'react';

import { POKEMON_TYPES } from '@/lib/constants';

import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface MovesFilterProps {
  filters: {
    type: string;
    category: string;
    searchTerm: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      type: string;
      category: string;
      searchTerm: string;
    }>
  >;
}

const MovesFilter: React.FC<MovesFilterProps> = ({ filters, setFilters }) => {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
        <Select
          value={filters.type}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, type: value }))
          }
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select type" />
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

        <Select
          value={filters.category}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, category: value }))
          }
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="physical">Physical</SelectItem>
            <SelectItem value="special">Special</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Input
        type="text"
        placeholder="Search moves..."
        value={filters.searchTerm}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
        }
        className="w-full"
      />
    </div>
  );
};

export default MovesFilter;
