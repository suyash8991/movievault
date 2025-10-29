'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Pagination Component
 *
 * Displays pagination controls for navigating between pages.
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  // Return null if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  // Calculate range of pages to display
  const getPageRange = (): number[] => {
    const range: number[] = [];
    const maxPagesToShow = 5;

    // Handle case with fewer pages than maxPagesToShow
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
      return range;
    }

    // Calculate start and end based on current page position
    let start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + maxPagesToShow - 1);

    // Adjust start if end is at max
    if (end === totalPages) {
      start = Math.max(1, end - maxPagesToShow + 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    return range;
  };

  // Get array of page numbers to display
  const pageRange = getPageRange();

  return (
    <div className="flex items-center justify-center space-x-1 mt-8">
      {/* Previous page button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className={`px-3 py-1 rounded-md ${
          currentPage <= 1
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-blue-600 hover:bg-blue-50'
        }`}
        aria-label="Previous page"
      >
        &laquo;
      </button>

      {/* First page button if not in range */}
      {pageRange[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-1 rounded-md text-blue-600 hover:bg-blue-50"
          >
            1
          </button>
          {pageRange[0] > 2 && <span className="px-1">...</span>}
        </>
      )}

      {/* Page number buttons */}
      {pageRange.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded-md ${
            page === currentPage
              ? 'bg-blue-600 text-white'
              : 'text-blue-600 hover:bg-blue-50'
          }`}
        >
          {page}
        </button>
      ))}

      {/* Last page button if not in range */}
      {pageRange[pageRange.length - 1] < totalPages && (
        <>
          {pageRange[pageRange.length - 1] < totalPages - 1 && (
            <span className="px-1">...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-1 rounded-md text-blue-600 hover:bg-blue-50"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next page button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={`px-3 py-1 rounded-md ${
          currentPage >= totalPages
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-blue-600 hover:bg-blue-50'
        }`}
        aria-label="Next page"
      >
        &raquo;
      </button>
    </div>
  );
}