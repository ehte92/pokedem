import React from 'react';

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

import { Button } from './ui/button';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <div className="flex flex-wrap justify-center items-center gap-2 mt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="w-10 sm:w-auto px-2 sm:px-3"
        title="First Page"
      >
        <ChevronsLeft className="h-4 w-4" />
        <span className="sr-only">First Page</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 sm:w-auto px-2 sm:px-3"
        title="Previous Page"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous Page</span>
      </Button>
      <span className="text-sm font-medium px-2">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 sm:w-auto px-2 sm:px-3"
        title="Next Page"
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next Page</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="w-10 sm:w-auto px-2 sm:px-3"
        title="Last Page"
      >
        <ChevronsRight className="h-4 w-4" />
        <span className="sr-only">Last Page</span>
      </Button>
    </div>
  );
};

export default PaginationControls;
